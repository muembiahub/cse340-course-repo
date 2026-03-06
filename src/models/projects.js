import db from './db.js'

const getAllServiceProjectsWithOrganizations = async () => {
  const query = `
    SELECT 
      ser.project_id,
      ser.title As project_title,
      ser.description,
      ser.location,
      ser.project_date,
      ser.organization_id,
      org.name AS organization_name,
      org.contact_email,
      org.logo_filename
    FROM service_projects ser
    JOIN organization org 
      ON ser.organization_id = org.organization_id;
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error fetching service projects with organizations:', err);
    throw err;
  }
};

export { getAllServiceProjectsWithOrganizations };
