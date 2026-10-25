const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

function renderHomeProjects(projects) {
  const grid = document.querySelector("#home-project-grid");
  if (!grid) return;

  const featured = projects.filter((project) => project.featured).slice(0, 3);
  if (!featured.length) {
    grid.innerHTML = `<p class="project-selection-empty">Selected projects will appear here.</p>`;
    return;
  }
  grid.innerHTML = featured.map((project, index) => {
    const image = project.images[0];
    const placement = ["project-card-tall", "project-card-offset", "project-card-third"][index];
    return `<a class="project-card ${placement}" href="projects/project.html?project=${encodeURIComponent(project.slug)}">
      <div class="project-image-wrap">
        ${image
          ? `<img src="${escapeHtml(image.url || image.src)}" alt="${escapeHtml(image.altText || image.alt)}" loading="lazy">`
          : `<span class="project-image-empty">Photography coming soon</span>`}
        <span class="project-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="project-meta"><span>${escapeHtml(project.name)}</span><span>${escapeHtml(project.type)}</span></div>
    </a>`;
  }).join("");
}

function updateHome(site, projects) {
  document.querySelector("#hero-location").textContent = site.heroLocation;
  document.querySelector("#hero-title").textContent = site.heroTitle;
  document.querySelector("#hero-link").firstChild.textContent = `${site.heroLink} `;
  document.querySelector("#work-title").textContent = site.workTitle;
  document.querySelector("#about-title").textContent = site.aboutTitle;
    const aboutBody = document.querySelector("#about-body");
    aboutBody.innerHTML = site.aboutBody
      .split(/\r?\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  document.querySelector("#contact-title").textContent = site.contactTitle;

  const email = document.querySelector("#contact-email");
  email.href = `mailto:${site.contactEmail}`;
  email.firstChild.textContent = `${site.contactEmail} `;

  const phone = document.querySelector("#contact-phone");
  phone.href = `tel:${site.contactPhone.replace(/[^\d+]/g, "")}`;
  phone.textContent = site.contactPhone;
  document.querySelector("#contact-location").textContent = site.contactLocation;
  renderHomeProjects(projects);
}

async function loadManagedContent() {
  const notice = document.querySelector("#content-update-notice");
  try {
    const response = await fetch("/api/content", { headers: { Accept: "application/json" } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Site content could not be loaded.");
    if (!result.site || !Array.isArray(result.projects)) {
      throw new Error("The server returned an incomplete site content document.");
    }
    updateHome(result.site, result.projects);
  } catch (error) {
    console.error("Failed to refresh public LHANA content:", error);
    notice.textContent = "Live content is temporarily unavailable. Showing the latest site copy saved with this page.";
    notice.hidden = false;
  }
}

loadManagedContent();
