// Import any needed model functions
import { getAllProjects,getUpcomingProjects, getProjectsDetailsById } from '../models/projects.js';
 const number_of_projects  = 5;
// Define any controller functions
const showProjectsPage = async (req, res) => {
    const projects = await getUpcomingProjects(number_of_projects);
    const title = 'Upcoming Service Projects';
    const button = 'Add Project'

    res.render('projects', { title, projects , button });
};
const showProjectDetailsPage = async (req, res) => {
  try {
    const project = await getProjectsDetailsById(req.params.id);

    // Comme getProjectsDetailsById retourne un tableau, on prend la première ligne
    const projectData = project ? project : null;

    const title = 'Project Details';
    const button = 'Edit Project';

    if (!projectData) {
      return res.status(404).render('error', { message: 'Projet introuvable' });
    }

    res.render('projectsdetails', { title, project: projectData, button });
  } catch (err) {
    console.error('Error showing project details:', err);
    res.status(500).render('error', { message: 'Erreur serveur lors du chargement du projet' });
  }
};


// Export any controller functions
export { showProjectsPage , showProjectDetailsPage};