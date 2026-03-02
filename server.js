import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

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
    const h1 = 'Upcoming Service Projects'
    const button = 'Learn More'
    res.render('projects', { title , h1,button });
});


app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
