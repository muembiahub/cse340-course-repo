// Import any needed model functions
import { body, validationResult } from 'express-validator';
import {getUpcomingProjects,
     getProjectsDetails,createProject
    } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';

import { getAllCategories } from '../models/categories.js';
import { updateProject, updateProjectCategories} from '../models/projects.js';



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
    const project = await getProjectsDetails(req.params.id);

    // Comme getProjectsDetails retourne un tableau, on prend la première ligne
    const projectData = project ? project : null;
    const title = 'Project Details';

    if (!projectData) {
      return res.status(404).render('errors', { message: 'Projet introuvable' });
    }

    res.render('projectsdetails', { title, project: projectData});
  } catch (err) {
    console.error('Error showing project details:', err);
    res.status(500).render('errors', { message: 'Erreur serveur lors du chargement du projet' });
  }
};

//  new project form 
const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Add New Service Project';
    res.render('new-project', {
         title, 
         organizations,
         messages: {
      success: req.flash('success'),
      errors: req.flash('errors')
    }
});
}
// process new project form

const processNewProjectForm = async (req, res) => {
    // Extract form data from req.body
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('errors', error.msg);
        });

        // Redirect back to the new project form
        return res.redirect('/new-project');
    }
    const { title, description, location, date, organizationId } = req.body;

    try {
        // Create the new project in the database
        const newProjectId = await createProject(title, description, location, date, organizationId);

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/projectsdetails/${newProjectId}`);
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('errors', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
}

//  edit project form 
const showEditProjectForm = async (req, res) => {
  const projectId = req.params.id;
  const project = await getProjectsDetails(projectId);
  const categories = await getAllCategories();
  const organizations = await getAllOrganizations();

  res.render('editProject', { 
    project,
    categories,
    organizations, 
    messages: {
      success: req.flash('success'),
      errors: req.flash('errors')
    }
  });
};

const processEditProjectForm = async (req, res) => {
  const projectId = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach(error => req.flash('errors', error.msg));
    return res.redirect(`/edit-project/${projectId}`);
  } else {
    req.flash('success', 'Project updated successfully!');
  }
  let { title, description, location, date, organizationId, categories } = req.body;

  // Normalize categories: always an array of IDs
  if (!Array.isArray(categories)) {
    categories = categories ? [categories] : [];
  }

  // Debug logs
  console.log("Processing edit form for project:", projectId);
  console.log("Project fields:", { title, description, location, date, organizationId });
  console.log("Categories received:", categories);

  try {
    // Update core project fields
    await updateProject(projectId, title, description, location, date, organizationId);

    // Update many-to-many categories
    await updateProjectCategories(projectId, categories);

    res.redirect(`/projectsdetails/${projectId}`);
  } catch (error) {
    console.error('Error updating project:', error.message);
    req.flash('errors', 'There was an error updating the project.');
    res.redirect(`/edit-project/${projectId}`);
  }
};



const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('location')
  .trim()
  .notEmpty().withMessage('Location is required')
  .isLength({ max: 200 }).withMessage('Location must be less than 200 characters')
  .matches(/^[^\d]+$/).withMessage('Location cannot be only numbers')
    ,
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty()
        .withMessage('Organization is required')
        .isInt()
        .withMessage('Organization must be a valid integer')
];

// Export any controller functions
export { showProjectsPage,
   showProjectDetailsPage,
    showNewProjectForm,
     processNewProjectForm,
        showEditProjectForm,
        processEditProjectForm,
     projectValidation
    };