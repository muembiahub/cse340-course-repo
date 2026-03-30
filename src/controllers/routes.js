import express from 'express';

import { showHomePage } from './index.js';
import {
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    organizationValidation,
    showOrganizationsPage,
    showEditOrganizationForm,
    processEditOrganizationForm
} 
from './organizations.js';

import { 
      showProjectsPage,
     showProjectDetailsPage,
     showNewProjectForm,
     processNewProjectForm,
        showEditProjectForm,
        processEditProjectForm,
     projectValidation
     }
      from './projects.js';
import { 
    showCategoriesPage , 
    showCategoryDetails, showAssignCategoriesForm,
     processAssignCategoriesForm,
      showNewCategoryForm,
       processNewCategoryForm,
        showEditCategoryForm,
         processEditCategoryForm,
          categoryValidation
         }
     from './categories.js';

import { testErrorPage } from './errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizationslist', showOrganizationsPage);
router.get('/organizationdetails/:id', showOrganizationDetailsPage);
// Route for new organization page
router.get('/new-organization', showNewOrganizationForm);
router.get('/edit-organizationdetails/:id', showEditOrganizationForm);
// Route to handle new organization form submission
router.post('/new-organization', organizationValidation, processNewOrganizationForm);
router.post('/edit-organizationdetails/:id', organizationValidation, processEditOrganizationForm);

router.get('/projects', showProjectsPage);
router.get('/projectsdetails/:id', showProjectDetailsPage);
// Route for new project page
router.get('/new-project',showNewProjectForm);
router.get('/edit-project/:id', showEditProjectForm);

// Route to handle new project form submission
router.post('/new-project',projectValidation, processNewProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);
router.get('/categories', showCategoriesPage);
router.get('/categorydetails/:id', showCategoryDetails);
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);
//  Route for editing category details
router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);

// Routes to handle the assign categories to project form
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;