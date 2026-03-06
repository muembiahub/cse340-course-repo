import express from 'express'; // import dotenv from 'dotenv';
import { fileURLToPath } from 'url';   
import path from 'path';
import { testConnection } from './src/models/db.js';
// import data from './src/models/organizations.js';
import { getAllOrganizations } from './src/models/organizations.js';
//   import { getAllServiceProjectsWithOrganizations } from './src/models/projects.js';
import { getAllServiceProjectsWithOrganizations } from './src/models/projects.js';

import {getAllCategories} from './src/models/categories.js';
// Define the the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || '.env no found';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Define the path to the directory containing the css file
const __filename = fileURLToPath(import.meta.url);
//  Define the path to the directory containing the css file
const __dirname = path.dirname(__filename);

//  Set the 'views' directory and the view engine
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    const button = 'Get Involved';
    res.render('organizations', { title,organizations, button });
});

app.get('/projects', async (req, res) => {
  const allProjects = await getAllServiceProjectsWithOrganizations();
  const title = 'Our Projects';
  const button = 'Get Involved';
  res.render('projects', { title, projects: allProjects, button });
});



app.get('/categories', async (req, res) => {
   const allCategories = await getAllCategories();
   console.log(allCategories);
    const title = 'Our Category Page';
    res.render('categories', { title, categories: allCategories });
});

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
