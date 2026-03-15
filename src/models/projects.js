import db from './db.js'

const getAllProjects = async () => {
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
      ON ser.organization_id = org.organization_id
    order by org.name;
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error fetching service projects with organizations:', err);
    throw err;
  }
};

const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location
        FROM service_projects
        WHERE organization_id = $1
        order by title;
      `;
      
      const query_params = [organizationId];
      const result = await db.query(query, query_params);

      return result.rows;
};
export { getAllProjects, getProjectsByOrganizationId };
