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
    const project = await getProjectsDetailsById(req.params.id);
    const title = 'Project Details';
    const button = 'Edit Project'

    res.render('projectsdetails', { title, project , button });
};

// Export any controller functions
export { showProjectsPage , showProjectDetailsPage};