import express from 'express'; // import dotenv from 'dotenv';
import { fileURLToPath } from 'url';   
import path from 'path';
import { testConnection } from './src/models/db.js';  // import { router } from './src/routes/index.js';
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
    const title = 'Our Partner Organizations';
    res.render('organizations', { title });
});

app.get('/projects', async (req, res) => {
    const title = 'Service Projects';
    const button = 'View All';
    res.render('projects', { title, button });
});

app.get('/categories', async (req, res) => {
    const title = 'Our Category Page';
    const h1 = 'Categories'
    const button = 'View All'
    const h2 = 'We have a variety of categories to choose from'
    const p = 'You can choose from a variety of categories to find the service project that is right for you'
    const p2 = 'We have a variety of categories to choose from'
    const p3 = 'If you are looking for a specific category, you can search for it using the search bar above'
    const a = 'Learn More'
    const a2 = 'Select a Category'
    const a3 = 'Search for a Category'
    res.render('categories', { title, h1, button, h2, p, p2, p3, a, a2, a3 });
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
