const projectGrid = document.querySelector("#project-grid");

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

window.lhanaContentReady.then(() => {
  if (window.lhanaSiteContent) {
    document.querySelector("#page-title").textContent = window.lhanaSiteContent.projectsTitle;
    document.querySelector("#projects-intro").textContent = window.lhanaSiteContent.projectsIntro;
  }
  projectGrid.innerHTML = window.lhanaProjects.map((project, index) => `
    <a class="project-list-card" href="project.html?project=${encodeURIComponent(project.slug)}">
      <div class="project-list-image">
        ${project.images[0]
          ? `<img src="${escapeHtml(project.images[0].src)}" alt="${escapeHtml(project.images[0].alt)}" loading="${index < 6 ? "eager" : "lazy"}">`
          : `<span class="project-image-empty">Photography coming soon</span>`}
        <span class="project-list-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="project-list-meta">
        <h2>${escapeHtml(project.name)}</h2>
        <span>${escapeHtml(project.type)}</span>
      </div>
    </a>
  `).join("");
});
