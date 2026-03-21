import db from './db.js'

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
// models/categories.js
const getAllCategoriesWithProjects = async (id) => {
  const query = `
    SELECT 
      cat.category_id,
      cat.name AS category_name,
      pro.project_id,
      pro.title AS project_name,
      pro.description,
      pro.project_date,
      pro.location
    FROM categories cat
    JOIN serviceprojectscategories spc 
      ON cat.category_id = spc.category_id
    JOIN service_projects pro 
      ON spc.project_id = pro.project_id
    WHERE cat.category_id = $1
    ORDER BY pro.project_date ASC;
  `;
  const result = await db.query(query, [id]);

  if (result.rows.length === 0) return null;

  return {
    category_id: result.rows[0].category_id,
    name: result.rows[0].category_name,
    projects: result.rows.map(row => ({
      project_id: row.project_id,
      project_name: row.project_name,
      description: row.description,
      project_date: row.project_date,
      location: row.location
    }))
  };
};


export { getAllCategories, getAllCategoriesWithProjects };
