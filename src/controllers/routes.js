import express from 'express';

import { showHomePage } from './index.js';
import { showOrganizationsPage } from './organizations.js';
import { showOrganizationDetailsPage } from './organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './projects.js';
import { showCategoriesPage , showCategoryDetails } from './categories.js';
import { testErrorPage } from './errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizationslist', showOrganizationsPage);
router.get('/organizationdetails/:id', showOrganizationDetailsPage);
router.get('/projects', showProjectsPage);
router.get('/projectsdetails/:id', showProjectDetailsPage);
router.get('/categories', showCategoriesPage);
router.get('/categorydetails/:id', showCategoryDetails);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;