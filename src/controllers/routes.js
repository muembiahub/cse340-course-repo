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
          categoryValidation,
          processDeleteCategoryForm
         }
     from './categories.js';


import { showUserRegistrationForm,
     processUserRegistrationForm, 
     showLoginForm, 
     processLoginForm,
      processLogout,requireRole,showDashboard, 
      showAdminDashboard,
      showAdminUsersPage, 
      showAdminUserRoleUpdatePage, 
      processAdminUserRoleUpdatePage,
      showVolunteerRegistrationForm,
      processVolunteerRegistrationForm, showVolunteerListPage,
      volunteerValidation,
      processVolunteerDeleteprojectId,
      processVolunteerUpdateForm
    
    } 
      from './user.js';


import { requireLogin,
 } from '../models/user.js';

import { testErrorPage } from './errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizationslist', showOrganizationsPage);
router.get('/organizationdetails/:id', showOrganizationDetailsPage);
// Route for new organization page
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.get('/edit-organizationdetails/:id',requireRole('admin'), showEditOrganizationForm);
// Route to handle new organization form submission
router.post('/new-organization', organizationValidation, requireRole('admin'), processNewOrganizationForm);
router.post('/edit-organizationdetails/:id', organizationValidation, requireRole('admin'), processEditOrganizationForm);

router.get('/projects', showProjectsPage);
router.get('/projectsdetails/:id', showProjectDetailsPage);
// Route for new project page
router.get('/new-project',requireRole('admin'), showNewProjectForm);
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);

// Route to handle new project form submission
router.post('/new-project',projectValidation, requireRole('admin'), processNewProjectForm);
router.post('/edit-project/:id', projectValidation, requireRole('admin'), processEditProjectForm);
router.get('/categories', showCategoriesPage);
router.get('/categorydetails/:id', showCategoryDetails);
router.get('/new-category', requireLogin, showNewCategoryForm);
router.post('/new-category', categoryValidation, requireRole('admin'), processNewCategoryForm);
//  Route for editing category details
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, requireRole('admin'), processEditCategoryForm);
router.post('/delete-category/:id', requireRole('admin'), processDeleteCategoryForm);

// Routes to handle the assign categories to project form
router.get('/assign-categories/:projectId',requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireRole('admin'), processAssignCategoriesForm);

// Show the volunteer registration form
router.get('/volunteer/registration/:projectId',requireLogin, showVolunteerRegistrationForm);

// Handle new volunteer registration
router.post('/volunteer/registration/:projectId', volunteerValidation,requireLogin, processVolunteerRegistrationForm);

// Handle volunteer update/edit
router.post('/volunteer/update/:projectId', volunteerValidation, requireLogin, processVolunteerUpdateForm);

// // Handle volunteer delete
// router.post('/volunteer/delete/:userId/:projectId', processVolunteerDeleteForm);

router.get('/dashboard/volunteer',volunteerValidation, requireLogin, showVolunteerListPage);
router.post('/volunteer/delete/:projectId',requireLogin, processVolunteerDeleteprojectId);


// User registration routes
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// User login routes
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// User dashboard routes
router.get('/dashboard', requireLogin, showDashboard);
router.get('/admin-dashboard', requireLogin, showAdminDashboard);
router.get('/admin/users', requireRole('admin'), showAdminUsersPage);
router.get('/admin/users/:id/updateRole', requireRole('admin'), showAdminUserRoleUpdatePage);
router.post('/admin/users/:id/updateRole', requireRole('admin'), processAdminUserRoleUpdatePage);


// error-handling routes
router.get('/test-error', testErrorPage);

export default router;