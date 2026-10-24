import { authorizeAdmin } from "./access.js";
import { jsonResponse, slugify, validateProject, validateSite } from "./content.js";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ["image/jpeg", { extension: "jpg", signature: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff }],
  ["image/png", { extension: "png", signature: (bytes) => bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10" }],
  ["image/webp", { extension: "webp", signature: (bytes) => String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" }],
  ["image/gif", { extension: "gif", signature: (bytes) => ["GIF87a", "GIF89a"].includes(String.fromCharCode(...bytes.slice(0, 6))) }]
]);

function methodNotAllowed() {
  return jsonResponse({ error: "Method not allowed." }, 405);
}

function requestOriginError(request) {
  return request.headers.get("Origin") === new URL(request.url).origin
    ? null
    : jsonResponse({ error: "The request origin is not allowed." }, 403);
}

function requireJsonRequest(request) {
  return request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() === "application/json"
    ? null
    : jsonResponse({ error: "Send content as JSON." }, 415);
}

async function readContent(db, includeHidden = false) {
  const [settings, projectsResult, imagesResult] = await Promise.all([
    db.prepare("SELECT * FROM site_settings WHERE id = 'site'").first(),
    db.prepare(
      `SELECT slug, name, type, description, position, featured, visible
       FROM projects ${includeHidden ? "" : "WHERE visible = 1"}
       ORDER BY position`
    ).all(),
    db.prepare(
      `SELECT id, project_slug, image_url, alt_text, position
       FROM project_images
       ORDER BY project_slug, position`
    ).all()
  ]);

  if (!settings) throw new Error("Content database has not been initialized. Apply the LHANA migration.");
  const imagesBySlug = new Map();
  for (const image of imagesResult.results || []) {
    const images = imagesBySlug.get(image.project_slug) || [];
    images.push({
      id: image.id,
      url: image.image_url,
      altText: image.alt_text,
      position: image.position
    });
    imagesBySlug.set(image.project_slug, images);
  }

  return {
    site: {
      heroLocation: settings.hero_location,
      heroTitle: settings.hero_title,
      heroLink: settings.hero_link,
      workTitle: settings.work_title,
      projectsTitle: settings.projects_title,
      projectsIntro: settings.projects_intro,
      aboutTitle: settings.about_title,
      aboutBody: settings.about_body,
      contactTitle: settings.contact_title,
      contactEmail: settings.contact_email,
      contactPhone: settings.contact_phone,
      contactLocation: settings.contact_location,
      updatedAt: settings.updated_at
    },
    projects: (projectsResult.results || []).map((project) => ({
      ...project,
      featured: Boolean(project.featured),
      visible: Boolean(project.visible),
      images: imagesBySlug.get(project.slug) || []
    }))
  };
}

async function requireAdmin(request, env) {
  const authorization = await authorizeAdmin(request, env);
  return authorization.ok
    ? null
    : jsonResponse({ error: authorization.message }, authorization.status);
}

async function handlePublicContent(env, headOnly) {
  if (!env.DB) return jsonResponse({ error: "Content storage is not configured." }, 503);
  try {
    const response = jsonResponse(await readContent(env.DB));
    return headOnly
      ? new Response(null, { status: response.status, headers: response.headers })
      : response;
  } catch (error) {
    console.error("Failed to read public LHANA content:", error);
    return jsonResponse({ error: "Public content could not be loaded. Check the D1 migration." }, 503);
  }
}

async function handleAdminContent(request, env) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.DB) return jsonResponse({ error: "Content storage is not configured." }, 503);

  if (request.method === "GET") {
    try {
      return jsonResponse(await readContent(env.DB, true));
    } catch (error) {
      console.error("Failed to read admin LHANA content:", error);
      return jsonResponse({ error: "Content could not be loaded. Check the D1 migration." }, 503);
    }
  }
  if (request.method !== "PUT") return methodNotAllowed();
  const originError = requestOriginError(request);
  if (originError) return originError;
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;

  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 20000) {
      return jsonResponse({ error: "Site content is too large." }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }
  const validationError = validateSite(body?.site);
  if (validationError) return jsonResponse({ error: validationError }, 400);

  const site = body.site;
  const updatedAt = new Date().toISOString();
  try {
    await env.DB.prepare(
      `UPDATE site_settings SET hero_location = ?, hero_title = ?, hero_link = ?,
       work_title = ?, projects_title = ?, projects_intro = ?, about_title = ?,
       about_body = ?, contact_title = ?, contact_email = ?, contact_phone = ?,
       contact_location = ?, updated_at = ?
       WHERE id = 'site'`
    ).bind(
      site.heroLocation.trim(),
      site.heroTitle.trim(),
      site.heroLink.trim(),
      site.workTitle.trim(),
      site.projectsTitle.trim(),
      site.projectsIntro.trim(),
      site.aboutTitle.trim(),
      site.aboutBody.trim(),
      site.contactTitle.trim(),
      site.contactEmail.trim(),
      site.contactPhone.trim(),
      site.contactLocation.trim(),
      updatedAt
    ).run();
    return jsonResponse({ saved: true, updatedAt });
  } catch (error) {
    console.error("Failed to save LHANA site content:", error);
    return jsonResponse({ error: "Could not save site content." }, 503);
  }
}

async function handleAdminProjects(request, env, url) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.DB) return jsonResponse({ error: "Content storage is not configured." }, 503);
  if (request.method !== "POST" && request.method !== "PUT" && request.method !== "DELETE") {
    return methodNotAllowed();
  }
  const originError = requestOriginError(request);
  if (originError) return originError;

  if (request.method === "DELETE") {
    const slug = url.searchParams.get("slug");
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return jsonResponse({ error: "Choose a valid project." }, 400);
    }
    try {
      const result = await env.DB.prepare(
        "UPDATE projects SET visible = 0, featured = 0, updated_at = ? WHERE slug = ?"
      ).bind(new Date().toISOString(), slug).run();
      if (!result.meta.changes) return jsonResponse({ error: "Project not found." }, 404);
      return jsonResponse({ saved: true });
    } catch (error) {
      console.error("Failed to hide LHANA project:", error);
      return jsonResponse({ error: "Could not update project visibility." }, 503);
    }
  }

  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 10000) {
      return jsonResponse({ error: "Project data is too large." }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }
  const validationError = validateProject(body);
  if (validationError) return jsonResponse({ error: validationError }, 400);

  const now = new Date().toISOString();
  try {
    if (request.method === "POST") {
      const slug = slugify(body.name);
      if (!slug) return jsonResponse({ error: "Project name must include a letter or number." }, 400);
      const existing = await env.DB.prepare("SELECT slug FROM projects WHERE slug = ?").bind(slug).first();
      if (existing) return jsonResponse({ error: "A project already uses this name." }, 409);
      const position = await env.DB.prepare(
        "SELECT COALESCE(MAX(position), 0) + 1 AS next FROM projects"
      ).first();
      if (body.featured) {
        const count = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM projects WHERE featured = 1 AND visible = 1"
        ).first();
        if (count.count >= 3) return jsonResponse({ error: "Choose up to three featured projects." }, 400);
      }
      await env.DB.prepare(
        `INSERT INTO projects (slug, name, type, description, position, featured, visible, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(slug, body.name.trim(), body.type.trim(), body.description.trim(),
        position.next, body.featured ? 1 : 0, body.visible ? 1 : 0, now).run();
      return jsonResponse({ saved: true, slug }, 201);
    }

    const slug = url.searchParams.get("slug");
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return jsonResponse({ error: "Choose a valid project." }, 400);
    }
    if (body.featured) {
      const count = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM projects WHERE featured = 1 AND visible = 1 AND slug <> ?"
      ).bind(slug).first();
      if (count.count >= 3) return jsonResponse({ error: "Choose up to three featured projects." }, 400);
    }
    const result = await env.DB.prepare(
      `UPDATE projects SET name = ?, type = ?, description = ?, featured = ?, visible = ?, updated_at = ?
       WHERE slug = ?`
    ).bind(body.name.trim(), body.type.trim(), body.description.trim(),
      body.featured ? 1 : 0, body.visible ? 1 : 0, now, slug).run();
    if (!result.meta.changes) return jsonResponse({ error: "Project not found." }, 404);
    return jsonResponse({ saved: true, slug });
  } catch (error) {
    console.error("Failed to save LHANA project:", error);
    return jsonResponse({ error: "Could not save project changes." }, 503);
  }
}

function hasImageSignature(bytes, type) {
  return IMAGE_TYPES.get(type)?.signature(bytes) === true;
}

async function handleAdminImages(request, env, url) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.DB || !env.GALLERY) {
    return jsonResponse({ error: "Project image storage is not configured." }, 503);
  }

  if (request.method === "POST") {
    const originError = requestOriginError(request);
    if (originError) return originError;
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("multipart/form-data")) {
      return jsonResponse({ error: "Send an image using the upload form." }, 415);
    }
    if (Number(request.headers.get("Content-Length")) > MAX_IMAGE_SIZE + 100000) {
      return jsonResponse({ error: "Choose an image up to 8 MB." }, 413);
    }
    let form;
    try {
      form = await request.formData();
    } catch {
      return jsonResponse({ error: "Send an image using the upload form." }, 400);
    }
    const file = form.get("image");
    const projectSlug = form.get("projectSlug");
    const altText = form.get("altText");
    if (!(file instanceof File) || file.size < 1 || file.size > MAX_IMAGE_SIZE) {
      return jsonResponse({ error: "Choose an image up to 8 MB." }, 400);
    }
    if (typeof projectSlug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectSlug)) {
      return jsonResponse({ error: "Choose an existing project." }, 400);
    }
    const format = IMAGE_TYPES.get(file.type);
    if (!format) return jsonResponse({ error: "Use a JPEG, PNG, WebP, or GIF image." }, 400);
    if (typeof altText !== "string" || !altText.trim() || altText.length > 240) {
      return jsonResponse({ error: "Add descriptive alt text (up to 240 characters)." }, 400);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasImageSignature(bytes, file.type)) {
      return jsonResponse({ error: "The file content does not match its image type." }, 400);
    }
    let project;
    try {
      project = await env.DB.prepare("SELECT slug FROM projects WHERE slug = ?")
        .bind(projectSlug).first();
    } catch (error) {
      console.error("Failed to check LHANA project before image upload:", error);
      return jsonResponse({ error: "Could not verify the selected project." }, 503);
    }
    if (!project) return jsonResponse({ error: "Choose an existing project." }, 404);
    const id = crypto.randomUUID();
    const filename = `${id}.${format.extension}`;
    const imageUrl = `/gallery-images/${filename}`;
    const key = `projects/${projectSlug}/${filename}`;
    try {
      await env.GALLERY.put(key, bytes, { httpMetadata: { contentType: file.type } });
      const next = await env.DB.prepare(
        "SELECT COALESCE(MAX(position), 0) + 1 AS next FROM project_images WHERE project_slug = ?"
      ).bind(projectSlug).first();
      await env.DB.prepare(
        "INSERT INTO project_images (id, project_slug, image_url, alt_text, position) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, projectSlug, imageUrl, altText.trim(), next.next).run();
      return jsonResponse({ uploaded: true }, 201);
    } catch (error) {
      try {
        await env.GALLERY.delete(key);
      } catch (cleanupError) {
        console.error("Unable to clean up an incomplete project image upload:", cleanupError);
      }
      console.error("Failed to save LHANA project image:", error);
      return jsonResponse({ error: "Could not save the project image." }, 503);
    }
  }

  const imageId = url.searchParams.get("id");
  if (request.method === "PUT") {
    const originError = requestOriginError(request);
    if (originError) return originError;
    const contentTypeError = requireJsonRequest(request);
    if (contentTypeError) return contentTypeError;
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, 400);
    }
    if (!body || typeof body !== "object" || !imageId || !/^[\w-]{36}$/.test(imageId)
      || typeof body.altText !== "string" || !body.altText.trim() || body.altText.length > 240) {
      return jsonResponse({ error: "Add descriptive alt text (up to 240 characters)." }, 400);
    }
    try {
      const result = await env.DB.prepare(
        "UPDATE project_images SET alt_text = ? WHERE id = ?"
      ).bind(body.altText.trim(), imageId).run();
      return result.meta.changes
        ? jsonResponse({ saved: true })
        : jsonResponse({ error: "Project image not found." }, 404);
    } catch (error) {
      console.error("Failed to update LHANA project image description:", error);
      return jsonResponse({ error: "Could not save the image description." }, 503);
    }
  }

  if (request.method === "DELETE") {
    const originError = requestOriginError(request);
    if (originError) return originError;
    if (!imageId || imageId.length > 100) return jsonResponse({ error: "Choose a valid project image." }, 400);
    try {
      const image = await env.DB.prepare(
        "SELECT image_url, project_slug FROM project_images WHERE id = ?"
      ).bind(imageId).first();
      if (!image) return jsonResponse({ error: "Project image not found." }, 404);
      const match = image.image_url.match(/^\/gallery-images\/([\w-]{36}\.(jpg|png|webp|gif))$/);
      if (match) await env.GALLERY.delete(`projects/${image.project_slug}/${match[1]}`);
      await env.DB.prepare("DELETE FROM project_images WHERE id = ?").bind(imageId).run();
      return jsonResponse({ deleted: true });
    } catch (error) {
      console.error("Failed to delete LHANA project image:", error);
      return jsonResponse({ error: "Could not remove the project image." }, 503);
    }
  }

  return methodNotAllowed();
}

async function handleProjectImage(request, env, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
  if (!env.DB) return new Response("Image storage is not configured.", { status: 503 });
  const filename = pathname.slice("/gallery-images/".length);
  const match = filename.match(/^([\w-]{36}\.(jpg|png|webp|gif))$/);
  if (!match || !env.GALLERY) return new Response("Not found.", { status: 404 });

  const image = await env.DB.prepare(
    "SELECT project_slug FROM project_images WHERE image_url = ?"
  ).bind(`/gallery-images/${filename}`).first();
  if (!image) return new Response("Not found.", { status: 404 });
  const object = await env.GALLERY.get(`projects/${image.project_slug}/${filename}`);
  if (!object) return new Response("Not found.", { status: 404 });
  return new Response(request.method === "HEAD" ? null : object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function jsonError(status, message) {
  return jsonResponse({ error: message }, status);
}

async function fetchAsset(request, env, path = null) {
  const url = new URL(request.url);
  if (path) url.pathname = path;
  return env.ASSETS.fetch(new Request(url, {
    method: request.method,
    headers: request.headers
  }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/api/content") {
      if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
      return handlePublicContent(env, request.method === "HEAD");
    }
    if (pathname === "/api/admin/content") return handleAdminContent(request, env);
    if (pathname === "/api/admin/projects") return handleAdminProjects(request, env, url);
    if (pathname === "/api/admin/images") return handleAdminImages(request, env, url);
    if (pathname.startsWith("/api/")) return jsonError(404, "Not found.");
    if (pathname.startsWith("/gallery-images/")) return handleProjectImage(request, env, pathname);

    if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin.html") {
      const denied = await requireAdmin(request, env);
      if (denied) return denied;
      if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
      const page = await fetchAsset(request, env, "/admin.html");
      const headers = new Headers(page.headers);
      headers.set("Cache-Control", "no-store");
      headers.set("X-Robots-Tag", "noindex, nofollow");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("X-Frame-Options", "DENY");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      headers.set(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; " +
        "img-src 'self' https://images.squarespace-cdn.com; " +
        "style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; " +
        "script-src 'self'; connect-src 'self'; object-src 'none'"
      );
      return new Response(request.method === "HEAD" ? null : page.body, {
        status: page.status,
        headers
      });
    }
    if (pathname.startsWith("/admin/")) {
      const denied = await requireAdmin(request, env);
      if (denied) return denied;
      return new Response("Not found.", { status: 404 });
    }

    return env.ASSETS.fetch(request);
  }
};
