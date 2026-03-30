document.addEventListener("DOMContentLoaded", () => {
  // Gestion des boutons "Ajouter"
  const newOrganizationBtn = document.querySelector(".add-new-organization");
  const newProjectBtn = document.querySelector(".add-new-project");

  if (newOrganizationBtn) {
    newOrganizationBtn.addEventListener("click", () => {
      window.location.href = "/new-organization";
    });
  }

  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {
      window.location.href = "/new-project";
    });
  }

  // Gestion des boutons "Modifier projet"
  const editProjectBtns = document.querySelectorAll(".edit-project");
  editProjectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const projectId = btn.dataset.id; // récupère l'ID du projet
      if (projectId) {
        window.location.href = `/edit-project/${projectId}`;
      } else {
        window.location.href = "/edit-project"; // fallback si pas d'ID
      }
    });
  });
});
