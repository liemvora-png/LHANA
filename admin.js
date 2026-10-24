const tabs = [...document.querySelectorAll("[role='tab']")];
const panel = document.querySelector("#editor-panel");
const status = document.querySelector("#editor-status");
const year = document.querySelector("#current-year");

let content = null;
let activeTab = "copy";
let selectedSlug = "";
let creatingProject = false;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

function setStatus(message, state = "") {
  status.textContent = message;
  status.dataset.state = state;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    }
  });
  if (!response.headers.get("Content-Type")?.includes("application/json")) {
    throw new Error(response.ok
      ? "The server returned an unreadable response. Try again or reload the editor."
      : "The admin API is unavailable. Start or deploy the Cloudflare Worker, then try again.");
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Try again or reload the editor.");
  }
  if (!response.ok) throw new Error(result.error || "The change could not be saved.");
  return result;
}

function updateTabs() {
  for (const tab of tabs) {
    const selected = tab.dataset.tab === activeTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  const active = tabs.find((tab) => tab.dataset.tab === activeTab);
  panel.setAttribute("aria-labelledby", active.id);
}

function render() {
  updateTabs();
  if (!content) {
    panel.innerHTML = `<div class="admin-empty-state">
      <button class="admin-button admin-button-secondary" id="retry-content" type="button">Retry loading content</button>
    </div>`;
    panel.querySelector("#retry-content").addEventListener("click", () => loadContent());
    return;
  }
  if (activeTab === "copy") renderCopy();
  if (activeTab === "projects") renderProjects();
  if (activeTab === "gallery") renderGallery();
}

function field(label, name, value, options = {}) {
  const id = `field-${name}`;
  const hint = options.hint ? `<span class="admin-field-hint" id="${id}-hint">${escapeHtml(options.hint)}</span>` : "";
  const attributes = [
    `id="${id}"`,
    `name="${name}"`,
    `maxlength="${options.maxlength || 500}"`,
    options.required === false ? "" : "required",
    options.type ? `type="${options.type}"` : "",
    options.autocomplete ? `autocomplete="${options.autocomplete}"` : ""
  ].filter(Boolean).join(" ");
  const control = options.multiline
    ? `<textarea ${attributes} rows="${options.rows || 3}" ${options.hint ? `aria-describedby="${id}-hint"` : ""}>${escapeHtml(value)}</textarea>`
    : `<input ${attributes} value="${escapeHtml(value)}" ${options.hint ? `aria-describedby="${id}-hint"` : ""}>`;
  return `<div class="admin-field ${options.className || ""}">
    <label for="${id}">${escapeHtml(label)}</label>
    ${control}${hint}
  </div>`;
}

function renderCopy() {
  const site = content.site;
  panel.innerHTML = `
    <form id="site-form" class="admin-form">
      <div class="admin-form-heading">
        <h3>Studio and homepage</h3>
        <p>These details appear across the public site.</p>
      </div>
      <div class="admin-field-grid">
        ${field("Hero location", "heroLocation", site.heroLocation, { maxlength: 80 })}
        ${field("Hero title", "heroTitle", site.heroTitle, { maxlength: 80 })}
        ${field("Hero link label", "heroLink", site.heroLink, { maxlength: 80 })}
        ${field("Projects heading", "workTitle", site.workTitle, { maxlength: 120 })}
        ${field("All projects title", "projectsTitle", site.projectsTitle, { maxlength: 120 })}
        ${field("All projects introduction", "projectsIntro", site.projectsIntro, { maxlength: 400, multiline: true, rows: 3, className: "admin-field-wide" })}
        ${field("About heading", "aboutTitle", site.aboutTitle, { maxlength: 180, className: "admin-field-wide" })}
        ${field("About text", "aboutBody", site.aboutBody, { maxlength: 700, multiline: true, rows: 4, className: "admin-field-wide" })}
      </div>
      <div class="admin-form-heading admin-form-heading-spaced">
        <h3>Contact details</h3>
        <p>Shown at the bottom of the homepage.</p>
      </div>
      <div class="admin-field-grid">
        ${field("Section heading", "contactTitle", site.contactTitle, { maxlength: 100 })}
        ${field("Email address", "contactEmail", site.contactEmail, { maxlength: 254, type: "email", autocomplete: "email" })}
        ${field("Phone number", "contactPhone", site.contactPhone, { maxlength: 40, autocomplete: "tel" })}
        ${field("Location", "contactLocation", site.contactLocation, { maxlength: 100 })}
      </div>
      <div class="admin-form-actions">
        <span class="admin-form-note">Changes are published when saved.</span>
        <button class="admin-button" type="submit">Save site copy</button>
      </div>
    </form>`;

  panel.querySelector("#site-form").addEventListener("submit", saveSite);
}

function renderProjects() {
  const projects = content.projects;
  if (!selectedSlug && projects.length) selectedSlug = projects[0].slug;
  const selectedProject = projects.find((project) => project.slug === selectedSlug);
  const projectList = projects.map((project) => `
    <button class="admin-project-choice ${project.slug === selectedSlug && !creatingProject ? "is-selected" : ""}" type="button" data-project="${escapeHtml(project.slug)}" aria-pressed="${project.slug === selectedSlug && !creatingProject}">
      <span class="admin-project-choice-name">${escapeHtml(project.name)}</span>
      <span class="admin-project-choice-meta">${escapeHtml(project.type)}${project.visible ? "" : " · Hidden"}</span>
    </button>`).join("");

  panel.innerHTML = `
    <div class="admin-project-layout">
      <div class="admin-project-list">
        <div class="admin-subheading"><h3>Projects</h3><span>${projects.length}</span></div>
        <div class="admin-project-choices">${projectList || `<p class="admin-empty">No projects yet.</p>`}</div>
        <button class="admin-button admin-button-secondary admin-new-project" id="new-project" type="button">Add a project <span aria-hidden="true">+</span></button>
      </div>
      <div class="admin-project-editor">
        ${selectedProject || creatingProject ? `
          <form id="project-form" class="admin-form">
            <div class="admin-form-heading">
              <h3>${creatingProject ? "New project" : escapeHtml(selectedProject.name)}</h3>
              <p>${creatingProject ? "Add a project to the portfolio." : `Project address: /projects/project.html?project=${escapeHtml(selectedProject.slug)}`}</p>
            </div>
            <div class="admin-field-grid">
              ${field("Project name", "name", creatingProject ? "" : selectedProject.name, { maxlength: 120 })}
              ${field("Project type", "type", creatingProject ? "" : selectedProject.type, { maxlength: 80 })}
              ${field("Description", "description", creatingProject ? "" : selectedProject.description, { maxlength: 700, multiline: true, rows: 4, className: "admin-field-wide", required: false })}
            </div>
            <div class="admin-checks">
              ${creatingProject ? "" : `<label class="admin-check"><input type="checkbox" name="visible" ${selectedProject.visible ? "checked" : ""}> <span>Visible on the public site</span></label>`}
              <label class="admin-check"><input type="checkbox" name="featured" ${!creatingProject && selectedProject.featured ? "checked" : ""}> <span>Feature on the homepage <small>(up to three)</small></span></label>
            </div>
            <div class="admin-form-actions">
              <span class="admin-form-note">${creatingProject ? "Photos can be added after saving." : "Project photos are managed in Photography."}</span>
              <button class="admin-button" type="submit">${creatingProject ? "Create project" : "Save project"}</button>
            </div>
          </form>` : `<p class="admin-empty">Choose a project to edit or add a new one.</p>`}
      </div>
    </div>`;

  panel.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSlug = button.dataset.project;
      creatingProject = false;
      render();
    });
  });
  panel.querySelector("#new-project").addEventListener("click", () => {
    creatingProject = true;
    selectedSlug = "";
    render();
    panel.querySelector("#field-name").focus();
  });
  panel.querySelector("#project-form")?.addEventListener("submit", saveProject);
}

function renderGallery() {
  const projects = content.projects;
  if (!selectedSlug && projects.length) selectedSlug = projects[0].slug;
  const project = projects.find((item) => item.slug === selectedSlug);
  const options = projects.map((item) => `
    <option value="${escapeHtml(item.slug)}" ${item.slug === selectedSlug ? "selected" : ""}>${escapeHtml(item.name)}${item.visible ? "" : " (hidden)"}</option>`
  ).join("");
  const images = project?.images || [];
  const imageList = images.map((image) => `
    <article class="admin-image-row">
      <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.altText)}" loading="lazy">
      <div class="admin-image-details">
        <label for="alt-${escapeHtml(image.id)}">Image description</label>
        <input id="alt-${escapeHtml(image.id)}" maxlength="240" value="${escapeHtml(image.altText)}" data-image-alt="${escapeHtml(image.id)}" required>
        <span>${image.url.startsWith("/gallery-images/") ? "Stored in LHANA gallery" : "Current portfolio image"}</span>
      </div>
      <div class="admin-image-actions">
        <button class="admin-button admin-button-secondary" type="button" data-save-image="${escapeHtml(image.id)}">Save description</button>
        <button class="admin-danger-button" type="button" data-remove-image="${escapeHtml(image.id)}">Remove</button>
      </div>
    </article>`).join("");

  panel.innerHTML = `
    <div class="admin-gallery-heading">
      <div class="admin-form-heading">
        <h3>Project photography</h3>
        <p>Add a photo, update its description, or remove it from a project's gallery.</p>
      </div>
      <div class="admin-field admin-project-select">
        <label for="gallery-project">Project</label>
        <select id="gallery-project" ${projects.length ? "" : "disabled"}>${options}</select>
      </div>
    </div>
    ${project ? `
      <form id="image-upload" class="admin-upload-form">
        <label class="admin-upload-file" for="image-file">
          <span class="admin-upload-icon" aria-hidden="true">↑</span>
          <span><strong>Choose a project photo</strong><small>JPEG, PNG, WebP or GIF · up to 8 MB</small></span>
          <input id="image-file" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required>
        </label>
        ${field("Image description", "altText", "", { maxlength: 240, hint: "Describe what is visible in the photograph." })}
        <button class="admin-button" type="submit">Upload photo</button>
      </form>
      <div class="admin-image-list-heading"><h3>Images in ${escapeHtml(project.name)}</h3><span>${images.length} ${images.length === 1 ? "image" : "images"}</span></div>
      <div class="admin-image-list">${imageList || `<p class="admin-empty">No photos yet. Add the first one above.</p>`}</div>`
      : `<p class="admin-empty">${projects.length ? "Choose a project to manage its images." : "Add and save a project before uploading photos."}</p>`}`;

  panel.querySelector("#gallery-project")?.addEventListener("change", (event) => {
    selectedSlug = event.target.value;
    render();
  });
  panel.querySelector("#image-upload")?.addEventListener("submit", uploadImage);
  panel.querySelectorAll("[data-save-image]").forEach((button) => {
    button.addEventListener("click", () => saveImageDescription(button.dataset.saveImage));
  });
  panel.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => removeImage(button.dataset.removeImage));
  });
}

async function loadContent(message = "Content loaded.") {
  setStatus("Loading your site content…");
  try {
    content = await request("/api/admin/content");
    if (!content.projects.some((project) => project.slug === selectedSlug)) {
      selectedSlug = content.projects[0]?.slug || "";
    }
    creatingProject = false;
    render();
    setStatus(message, "success");
  } catch (error) {
    content = null;
    render();
    setStatus(error.message, "error");
  }
}

async function saveSite(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const site = Object.fromEntries(form.entries());
  setStatus("Saving site copy…");
  try {
    await request("/api/admin/content", { method: "PUT", body: JSON.stringify({ site }) });
    await loadContent("Site copy saved and published.");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function saveProject(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = {
    name: String(form.get("name") || "").trim(),
    type: String(form.get("type") || "").trim(),
    description: String(form.get("description") || "").trim(),
    featured: form.has("featured") && (creatingProject || form.has("visible")),
    visible: creatingProject || form.has("visible")
  };
  setStatus(creatingProject ? "Adding project…" : "Saving project…");
  try {
    const result = await request(
      creatingProject ? "/api/admin/projects" : `/api/admin/projects?slug=${encodeURIComponent(selectedSlug)}`,
      { method: creatingProject ? "POST" : "PUT", body: JSON.stringify(body) }
    );
    selectedSlug = result.slug || selectedSlug;
    creatingProject = false;
    await loadContent("Project saved and published.");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function uploadImage(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  form.set("projectSlug", selectedSlug);
  setStatus("Uploading photo…");
  try {
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form
    });
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error(response.ok
        ? "The server returned an unreadable response. Try again or reload the editor."
        : "The admin API is unavailable. Start or deploy the Cloudflare Worker, then try again.");
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The photo could not be uploaded.");
    await loadContent("Photo uploaded and published.");
  } catch (error) {
    setStatus(error.message || "The photo could not be uploaded. Try again.", "error");
  }
}

async function saveImageDescription(id) {
  const input = panel.querySelector(`[data-image-alt="${CSS.escape(id)}"]`);
  setStatus("Saving image description…");
  try {
    await request(`/api/admin/images?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ altText: input.value })
    });
    await loadContent("Image description saved.");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function removeImage(id) {
  if (!window.confirm("Remove this photo from the project gallery?")) return;
  setStatus("Removing photo…");
  try {
    await request(`/api/admin/images?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadContent("Photo removed from the project.");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.tab;
    render();
  });
  tab.addEventListener("keydown", (event) => {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const next = (index + direction + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });
});

year.textContent = String(new Date().getFullYear());
render();
loadContent();
