import db from './db.js';

const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title as project_title,
          project_date,
          description,
          location
        FROM service_projects
        WHERE organization_id = $1
        order by project_title;
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

const getProjectsDetails = async (projectId) => {
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
    LEFT JOIN organization org 
      ON ser.organization_id = org.organization_id
    LEFT JOIN serviceprojectscategories cat
      ON ser.project_id = cat.project_id
    LEFT JOIN categories c
      ON cat.category_id = c.category_id
    WHERE ser.project_id = $1
    GROUP BY ser.project_id, ser.title, ser.description, ser.location, ser.project_date, ser.organization_id, org.name, org.contact_email
    ORDER BY ser.project_date ASC;
  `;

  try {
    const result = await db.query(query, [projectId]);

    if (result.rows.length === 0) return null;

    const row0 = result.rows[0];

    return {
      project_id: row0.project_id,
      project_title: row0.project_title,
      description: row0.description,
      location: row0.location,
      project_date: row0.project_date,
      organization_id: row0.organization_id,
      organization_name: row0.organization_name,
      contact_email: row0.contact_email,
      category_ids: row0.category_ids || [],
      category_names: row0.category_names || []
    };
  } catch (err) {
    console.error("Error fetching project details:", err);
    throw err;
  }
};



const createProject = async (title, description, location, date, organizationId) => {
    const query = `
      INSERT INTO service_projects (title, description, location, project_date, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING project_id;
    `;

    const query_params = [title, description, location, date, organizationId];

    try {
        const result = await db.query(query, query_params);

        if (result.rows.length === 0) {
            throw new Error('Failed to create project');
        }

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Created new project with ID:', result.rows[0].project_id);
        }

        return result.rows[0].project_id;
    } catch (err) {
        console.error('Database error creating project:', err.message);
        console.error('Full error object:', err); // shows details like code, detail, hint
        throw err; // rethrow so controller can handle
    }
};
const updateProject = async (projectId, title, description, location, date, organizationId) => {
  const query = `
    UPDATE service_projects
    SET title = $1, description = $2, location = $3, project_date = $4, organization_id = $5
    WHERE project_id = $6
    RETURNING project_id;
  `;
  const params = [title, description, location, date, organizationId, projectId];

  // Debug log
  console.log("Executing updateProject with params:", params);

  try {
    const result = await db.query(query, params);
    if (result.rows.length === 0) throw new Error('Failed to update project');
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
      console.log('Updated project with ID:', result.rows[0].project_id);
    }
  } catch (err) {
    console.error('Database error updating project:', err.message);
    throw err;
  }
};


const updateProjectCategories = async (projectId, categories) => {
  console.log("Updating categories for project:", projectId, "with categories:", categories);

  await db.query(`DELETE FROM serviceprojectscategories WHERE project_id = $1`, [projectId]);

  if (Array.isArray(categories)) {
    for (const categoryId of categories) {
      console.log("Inserting category link:", projectId, categoryId);
      await db.query(
        `INSERT INTO serviceprojectscategories (project_id, category_id) VALUES ($1, $2)`,
        [projectId, categoryId]
      );
    }
  }
};



export {getUpcomingProjects,
   getProjectsByOrganizationId,
    getProjectsDetails,
     createProject,
     updateProject,
     updateProjectCategories};
