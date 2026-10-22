const projectGrid = document.querySelector("#project-grid");

projectGrid.innerHTML = window.lhanaProjects.map((project, index) => `
  <a class="project-list-card" href="project.html?project=${encodeURIComponent(project.slug)}">
    <div class="project-list-image">
      <img src="${project.images[0].src}" alt="${project.images[0].alt}" loading="${index < 6 ? "eager" : "lazy"}">
      <span class="project-list-arrow" aria-hidden="true">↗</span>
    </div>
    <div class="project-list-meta">
      <h2>${project.name}</h2>
      <span>${project.type}</span>
    </div>
  </a>
`).join("");
