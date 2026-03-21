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


const getUpcomingProjects = async (number_of_projects) => {
  const query = `
   SELECT 
  ser.project_id,
  ser.title AS project_title,
  ser.description,
  ser.location,
  ser.project_date,
  ser.organization_id,
  org.name AS organization_name,
  org.contact_email,
  array_agg(c.category_id) AS category_ids,
  array_agg(c.name) AS category_names
FROM service_projects ser
JOIN organization org 
  ON ser.organization_id = org.organization_id
JOIN serviceprojectscategories cat
  ON ser.project_id = cat.project_id
JOIN categories c
  ON cat.category_id = c.category_id
WHERE ser.project_date >= CURRENT_DATE
GROUP BY ser.project_id, ser.title, ser.description, ser.location, ser.project_date, ser.organization_id, org.name, org.contact_email
ORDER BY ser.project_date ASC
LIMIT $1;

  `;

  try {
    const result = await db.query(query, [number_of_projects]);
    return result.rows; // returns an array of project objects
  } catch (err) {
    console.error('Error fetching upcoming projects:', err);
    throw err;
  }
};


const getProjectsDetailsById = async (projectId) => {
  const query = `
    SELECT 
  ser.project_id,
  ser.title AS project_title,
  ser.description,
  ser.location,
  ser.project_date,
  ser.organization_id,
  org.name AS organization_name,
  org.contact_email,
  array_agg(c.category_id) AS category_ids,
  array_agg(c.name) AS category_names
FROM service_projects ser
JOIN organization org 
  ON ser.organization_id = org.organization_id
JOIN serviceprojectscategories cat
  ON ser.project_id = cat.project_id
JOIN categories c
  ON cat.category_id = c.category_id
GROUP BY ser.project_id, ser.title, ser.description, ser.location, ser.project_date, ser.organization_id, org.name, org.contact_email
ORDER BY ser.project_date ASC
LIMIT $1;
  `;

  const query_params = [projectId];

  try {
    const result = await db.query(query, query_params);
    return result.rows[0]; // return a single project object
  } catch (err) {
    console.error('Error fetching project details:', err);
    throw err;
  }
};

export { getAllProjects,getUpcomingProjects, getProjectsByOrganizationId, getProjectsDetailsById };
