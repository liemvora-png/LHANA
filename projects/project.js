const requestedSlug = new URLSearchParams(window.location.search).get("project");

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

window.lhanaContentReady.then(() => {
  const projectIndex = window.lhanaProjects.findIndex((item) => item.slug === requestedSlug);
  const project = window.lhanaProjects[projectIndex];

  if (project) {
    document.title = `${project.name} — LHANA`;
    document.querySelector('meta[name="description"]').content = project.description;
    document.querySelector("#project-title").textContent = project.name;
    document.querySelector("#project-type").textContent =
      `${project.type} · ${window.lhanaSiteContent?.contactLocation || "Houston, Texas"}`;
    document.querySelector("#project-description").textContent = project.description;

    document.querySelector("#project-gallery").innerHTML = project.images.map((image, index) => {
      const fullSizeImage = image.src.replace("?format=1400w", "?format=2500w");
      return `
        <a class="project-gallery-image" href="${escapeHtml(fullSizeImage)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(project.name)} photograph ${index + 1} in a new tab">
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="${index < 2 ? "eager" : "lazy"}">
          <span aria-hidden="true">↗</span>
        </a>
      `;
    }).join("") || `<p class="projects-lede">Photography will be added to this project soon.</p>`;

    const nextProject = window.lhanaProjects[(projectIndex + 1) % window.lhanaProjects.length];
    const nextProjectLink = document.querySelector("#next-project");
    nextProjectLink.href = `project.html?project=${encodeURIComponent(nextProject.slug)}`;
    nextProjectLink.firstChild.textContent = `${nextProject.name} `;
  } else {
    document.title = "Project not found — LHANA";
    document.querySelector("#project-title").textContent = "Project not found";
    document.querySelector("#project-description").textContent = "This project may have moved. Browse the full collection to find another space.";
    document.querySelector("#project-gallery").remove();
    document.querySelector(".project-pagination").remove();
  }
});
