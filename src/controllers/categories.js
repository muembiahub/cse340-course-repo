// Import any needed model functions
import { getAllCategories, getAllCategoriesWithProjects} from '../models/categories.js';

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';

    res.render('categories', { title, categories });
}; 
const showCategoryDetails = async (req, res) => {
  const category = await getAllCategoriesWithProjects(req.params.id);

  if (!category) {
    return res.status(404).send('Category not found');
  }

  const title = category.name;
  res.render('categorydetails', { title, category });
};



// Export any controller functions
export { showCategoriesPage, showCategoryDetails };