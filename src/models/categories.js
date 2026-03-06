import db from './db.js'

const getAllCategories = async () => {
  const query = `
    SELECT name As category_name
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

export { getAllCategories };
