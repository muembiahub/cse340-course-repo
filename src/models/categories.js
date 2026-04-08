import db from './db.js'
//  get all categories function =================
const getAllCategories = async () => {
  const query = `
    SELECT category_id, name As category_name
    FROM public.categories
    ORDER BY category_name;
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error fetching service projects with organizations:', err);
    throw err;
  }
};

const getProjectsByCategory = async (categoryId) => {
  const query = `
    SELECT 
      ser.project_id,
      ser.title AS project_title,
      ser.description,
      ser.location,
      ser.organization_id,
      ser.project_date,
      org.name AS organization_name,
      org.contact_email
    FROM service_projects ser
    JOIN serviceprojectscategories srcat 
      ON ser.project_id = srcat.project_id
    JOIN organization org
      ON ser.organization_id = org.organization_id
    WHERE srcat.category_id = $1
    ORDER BY ser.project_date ASC;
  `;
  const result = await db.query(query, [categoryId]);
  return result.rows; // tableau de projets liés à cette catégorie
};


const getAllCategoriesWithProjects = async (projectId) => {
  const query = `
    SELECT 
      cat.category_id,
      cat.name AS category_name
    FROM categories cat
    JOIN serviceprojectscategories srcat 
      ON cat.category_id = srcat.category_id
    JOIN service_projects ser
      ON srcat.project_id = ser.project_id
    WHERE srcat.project_id = $1
    ORDER BY cat.name ASC;
  `;

  const result = await db.query(query, [projectId]);
  return result.rows; // always an array
};


//  assign category to project function =================
//   This function will be used to assign a category to a project by inserting a record into the serviceprojectscategories table. It takes the categoryId and projectId as parameters and executes an INSERT query to create the association between the category and the project in the database.
const assignCategoryToProject = async (categoryId, projectId) => {
  const query = `
    INSERT INTO serviceprojectscategories (category_id, project_id)
    VALUES ($1, $2);
  `;
  await db.query(query, [categoryId, projectId]);
};
//  update category assignments function =================
//   This function will be used to update the assignments of a category to a project by deleting the existing records in the serviceprojectscategories table and inserting new records based on the provided categoryIds array. It takes the projectId and categoryIds as parameters and executes a DELETE and multiple INSERT queries to update the category assignments in the database.
const updateCategoryAssignments = async (projectId, categoryIds) => {
  const deleteQuery = `
    DELETE FROM serviceprojectscategories
    WHERE project_id = $1;
  `;
  await db.query(deleteQuery, [projectId]);

  for (const categoryId of categoryIds) {
    await assignCategoryToProject(categoryId, projectId);
  }
};
//  new category form =================
const createCategory = async (categoryName) => {
  const query = `
    INSERT INTO categories (name)
    VALUES ($1)
    RETURNING *;
  `;
  const result = await db.query(query, [categoryName]);
  return result.rows[0];
};
 const updateCategory = async (categoryId, categoryName) => {
  const query = `
    UPDATE categories
    SET name = $1
    WHERE category_id = $2
    RETURNING *;
  `;
  const result = await db.query(query, [categoryName, categoryId]);
  return result.rows[0];
}
const getCategoryById = async (categoryId) => {
  const query = `
    SELECT category_id, name AS category_name
    FROM categories
    WHERE category_id = $1;
  `;
  const result = await db.query(query, [categoryId]);
  return result.rows[0];
};

// delete category function =================
const deleteCategory = async (categoryId) => {
  const query = `
    DELETE FROM categories
    WHERE category_id = $1;
  `;
  await db.query(query, [categoryId]);
};

//  =================== export function ================================
//   This function will be used to get all the categories from the database and return them as an array of objects. It executes a SELECT query to retrieve all the records from the categories table and returns the result as an array of objects.
export { getAllCategories, getProjectsByCategory,
   getAllCategoriesWithProjects,updateCategoryAssignments, createCategory, updateCategory, getCategoryById, deleteCategory};
