const SITE_FIELDS = {
  heroLocation: 80,
  heroTitle: 80,
  heroLink: 80,
  workTitle: 120,
  projectsTitle: 120,
  projectsIntro: 400,
  aboutTitle: 180,
  aboutBody: 700,
  contactTitle: 100,
  contactEmail: 254,
  contactPhone: 40,
  contactLocation: 100
};

function isText(value, limit) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
}

export function validateSite(site) {
  if (!site || typeof site !== "object" || Array.isArray(site)) {
    return "Submit valid site details.";
  }
  for (const [field, limit] of Object.entries(SITE_FIELDS)) {
    if (!isText(site[field], limit)) return `Enter a valid value for ${field}.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail)) {
    return "Enter a valid contact email address.";
  }
  return null;
}

export function validateProject(project) {
  if (!project || typeof project !== "object" || Array.isArray(project)
    || !isText(project.name, 120)
    || !isText(project.type, 80)
    || typeof project.description !== "string"
    || project.description.length > 700
    || typeof project.featured !== "boolean"
    || typeof project.visible !== "boolean"
    || (project.featured && !project.visible)) {
    return "Check the project name, type, description, and visibility.";
  }
  return null;
}

export function slugify(value) {
  return value.trim().toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
