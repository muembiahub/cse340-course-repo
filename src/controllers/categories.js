// Import any needed model functions
import { body, validationResult } from 'express-validator';
import { getAllCategories, 
    getProjectsByCategory,
     getAllCategoriesWithProjects,
     updateCategoryAssignments,
      createCategory, updateCategory, getCategoryById, deleteCategory } from '../models/categories.js';
import{getProjectsDetails} from '../models/projects.js'


// Define  controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';

    res.render('categories', { 
      title,
      role: res.locals.user ? res.locals.user.role_name : null,
      categories });
}; 
const showCategoryDetails = async (req, res) => {
  const categoryId = req.params.id;

  // Récupérer la catégorie elle-même
  const categories = await getAllCategories();
  const category = categories.find(c => c.category_id == categoryId);

  if (!category) {
    return res.status(404).send('Category not found');
  }

  // Récupérer les projets liés à cette catégorie
  const projects = await getProjectsByCategory(categoryId);
  const organizations = projects.map(p => ({
    organization_id: p.organization_id,
    organization_name: p.organization_name,
    contact_email: p.contact_email
  }));
  

  const title = category.category_name;
  res.render('categorydetails', {
     title,
      category,
        organizations,
       projects,
        messages: {
      success: req.flash('success'),
      errors: req.flash('errors')
    } 
  });
}



// controllers/categories.js
const showAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;

    const projectDetails = await getProjectsDetails(projectId);
    const categories = await getAllCategories();
    const assignedCategories = await getAllCategoriesWithProjects(projectId);

    const title = 'Assign Categories to Project';

    res.render('assign-categories', { 
      title, 
      projectId,
       projectDetails,
        categories,
         assignedCategories 
        });
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const selectedCategoryIds = req.body.categoryIds || [];
    
    // Ensure selectedCategoryIds is an array
    const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];
    await updateCategoryAssignments(projectId, categoryIdsArray);
    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/projectsdetails/${projectId}`);
};


/**
 * Show new category form
 */
const showNewCategoryForm = (req, res) => {
  const title = "Add New Service Category";

  res.render("new-category", {
    title,
    messages: {
      success: req.flash("success"),
      errors: req.flash("errors"),
    },
  });
};

/**
 * Process new category form
 */
const processNewCategoryForm = async (req, res) => {
  const { category_name } = req.body;
  const results = validationResult(req);

  // Validation failed
  if (!results.isEmpty()) {
    results.array().forEach(error =>
      req.flash("errors", error.msg)
    );
    return res.redirect("/new-category");
  }

  try {
    await createCategory(category_name.trim());

    req.flash("success", "New category added successfully.");
    return res.redirect("/categories");
  } catch (err) {
    console.error(err);
    req.flash("errors", "Failed to create category.");
    return res.redirect("/new-category");
  }
};

/**
 * Show edit category form
 */
const showEditCategoryForm = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await getCategoryById(categoryId);

    if (!category) {
      req.flash("errors", "Category not found.");
      return res.redirect("/categories");
    }

    const title = "Edit Service Category";

    res.render("edit-category", {
      title,
      category,
      messages: {
        success: req.flash("success"),
        errors: req.flash("errors"),
      },
    });
  } catch (err) {
    console.error(err);
    req.flash("errors", "Unable to load category.");
    res.redirect("/categories");
  }
};

/**
 * Process edit category form
 */
const processEditCategoryForm = async (req, res) => {
  const categoryId = req.params.id;
  const { category_name } = req.body;
  const results = validationResult(req);

  // Validation failed
  if (!results.isEmpty()) {
    results.array().forEach(error =>
      req.flash("errors", error.msg)
    );
    return res.redirect(`/edit-category/${categoryId}`);
  }

  try {
    const category = await getCategoryById(categoryId);

    if (!category) {
      req.flash("errors", "Category not found.");
      return res.redirect("/categories");
    }

    await updateCategory(categoryId, category_name.trim());

    req.flash("success", "Category updated successfully.");
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An unexpected error occurred.");
    res.redirect(`/edit-category/${categoryId}`);
  }
};

// Process delete category form
const processDeleteCategoryForm = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await getCategoryById(categoryId);

    if (!category) {
      req.flash("errors", "Category not found.");
      return res.redirect("/categories");
    }

    await deleteCategory(categoryId);

    req.flash("success", "Category deleted successfully.");
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    req.flash("errors", "An unexpected error occurred.");
    res.redirect(`/categorydetails/${categoryId}`);
  }
};


/**
 * Category validation rules
 */
const categoryValidation = [
  body("category_name")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage('Category name is required (3–150 characters).')
];




// Export any controller functions
export { showCategoriesPage,
   showCategoryDetails, 
   showAssignCategoriesForm,
    processAssignCategoriesForm,
     showNewCategoryForm,
      processNewCategoryForm,
       showEditCategoryForm,
        processEditCategoryForm,
        processDeleteCategoryForm,
         categoryValidation };