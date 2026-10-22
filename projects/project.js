const requestedSlug = new URLSearchParams(window.location.search).get("project");
const projectIndex = window.lhanaProjects.findIndex((project) => project.slug === requestedSlug);
const project = window.lhanaProjects[projectIndex];

if (project) {
  document.title = `${project.name} — LHANA`;
  document.querySelector('meta[name="description"]').content = project.description;
  document.querySelector("#project-title").textContent = project.name;
  document.querySelector("#project-type").textContent = `${project.type} · Houston, Texas`;
  document.querySelector("#project-description").textContent = project.description;

  document.querySelector("#project-gallery").innerHTML = project.images.map((image, index) => `
    <a class="project-gallery-image" href="${image.src.replace("?format=1400w", "?format=2500w")}" target="_blank" rel="noreferrer" aria-label="Open ${project.name} photograph ${index + 1} in a new tab">
      <img src="${image.src}" alt="${image.alt}" loading="${index < 2 ? "eager" : "lazy"}">
      <span aria-hidden="true">↗</span>
    </a>
  `).join("");

  const nextProject = window.lhanaProjects[(projectIndex + 1) % window.lhanaProjects.length];
  const nextProjectLink = document.querySelector("#next-project");
  nextProjectLink.href = `project.html?project=${encodeURIComponent(nextProject.slug)}`;
  nextProjectLink.innerHTML = `${nextProject.name} <span aria-hidden="true">→</span>`;
} else {
  document.title = "Project not found — LHANA";
  document.querySelector("#project-title").textContent = "Project not found";
  document.querySelector("#project-description").textContent = "This project may have moved. Browse the full collection to find another space.";
  document.querySelector("#project-gallery").remove();
  document.querySelector(".project-pagination").remove();
}
