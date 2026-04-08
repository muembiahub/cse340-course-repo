import db from './db.js';
import bcrypt from 'bcrypt';


const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4)) 
        RETURNING user_id
    `;
    const query_params = [name, email, passwordHash, default_role];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
    SELECT u.user_id, u.email, u.name, u.password_hash, r.role_name 
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.email = $1
`;
    const query_params = [email];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

// find user by id function =================

const findUserById = async (userId) => {
    const query = `
    SELECT u.user_id, u.email, u.name, u.password_hash, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = $1
`;
    const query_params = [userId];

    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
}

/**
 * Get all users with their roles
 */
const getAllUsers = async () => {
  const query = `
    SELECT 
      u.user_id,
      u.name,
      u.email,
      r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.user_id ASC
  `;

  const result = await db.query(query);
  return result.rows;
};



const verifyPassword = async (password, passwordHash) => {
    console.log('Verifying password. Input password:', password, 'Password hash:', passwordHash);
    return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    console.log('Authenticating user. Found user:', user);

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    return user;
}

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};
// get user role function =================

const getAllRoles = async () => {
    const query = `
    SELECT role_id, role_name
    FROM roles
    ORDER BY role_name ASC
  `;
    const result = await db.query(query);
    return result.rows;
  };


//  update user role function =================

const updateUserRole = async (userId, roleId) => {
    const query = `
    UPDATE users
    SET role_id = $1
    WHERE user_id = $2
  `;

  const result = await db.query(query, [roleId, userId]);
  return result.rows;
}


 



/**
 * ======================================================
 * Volunteer Model
 * ======================================================
 * Rules enforced:
 * - Always pass (userId, projectId) in that order
 * - Never trust the caller for authorization
 * - Always return deterministic values
 * ======================================================
 */

/**
 * Get all projects a user has volunteered for
 */
const getVolunteerProjects = async (userId) => {
  const query = `
    SELECT
      p.project_id,
      p.title AS project_title,
      p.description,
      p.location,
      p.project_date,
      v.role_type,
      v.hours_committed,
      v.date_to_start,
      v.status AS volunteer_status
    FROM service_projects p
    INNER JOIN volunteer v
      ON p.project_id = v.project_id
    WHERE v.user_id = $1
    ORDER BY p.project_date DESC
  `;

  try {
    const { rows } = await db.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("Error fetching volunteer projects:", error);
    throw error;
  }
};

/**
 * Get all volunteers assigned to a specific project
 */
const getProjectVolunteers = async (projectId) => {
  const query = `
    SELECT
      u.user_id,
      u.name,
      v.role_type,
      v.hours_committed,
      v.status AS volunteer_status,
      v.volunteered_at
    FROM Users u
    INNER JOIN volunteer v
      ON u.user_id = v.user_id
    WHERE v.project_id = $1
    ORDER BY u.name
  `;

  try {
    const { rows } = await db.query(query, [projectId]);
    return rows;
  } catch (error) {
    console.error("Error fetching project volunteers:", error);
    throw error;
  }
};

/**
 * Check if a user is already assigned to a project
 */
const isVolunteerAssigned = async (userId, projectId) => {
  const query = `
    SELECT 1
    FROM volunteer
    WHERE user_id = $1 AND project_id = $2
    LIMIT 1
  `;

  try {
    const { rowCount } = await db.query(query, [userId, projectId]);
    return rowCount > 0;
  } catch (error) {
    console.error("Error checking volunteer assignment:", error);
    throw error;
  }
};

/**
 * Get a volunteer record by user and project
 */
const getVolunteerByUserAndProject = async (userId, projectId) => {
  const query = `
    SELECT *
    FROM volunteer
    WHERE user_id = $1 AND project_id = $2
    LIMIT 1
  `;

  try {
    const { rows } = await db.query(query, [userId, projectId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    throw error;
  }
};

/**
 * Register a new volunteer
 */
const volunteeRegistration = async (
  userId,
  projectId,
  roleType,
  hoursCommitted,
  status = "Active",
  dateToStart
) => {
  const query = `
    INSERT INTO volunteer (
      user_id,
      project_id,
      role_type,
      hours_committed,
      status,
      date_to_start
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  try {
    const { rows } = await db.query(query, [
      userId,
      projectId,
      roleType,
      hoursCommitted,
      status,
      dateToStart
    ]);
    return rows[0];
  } catch (error) {
    console.error("Error registering volunteer:", error);
    throw error;
  }
};

/**
 * Update an existing volunteer assignment
 */
const updateVolunteer = async (
  volunteerId,
  roleType,
  hoursCommitted,
  status,
  dateToStart
) => {
  const query = `
    UPDATE volunteer
    SET
      role_type = $2,
      hours_committed = $3,
      status = $4,
      date_to_start = $5
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const { rows } = await db.query(query, [
      volunteerId,
      roleType,
      hoursCommitted,
      status,
      dateToStart
    ]);
    return rows[0];
  } catch (error) {
    console.error("Error updating volunteer:", error);
    throw error;
  }
};

/**
 * Delete a volunteer assignment
 * IMPORTANT: order must be (userId, projectId)
 */
const deleteVolunteerAssignment = async (userId, projectId) => {
  const query = `
    DELETE FROM volunteer
    WHERE user_id = $1 AND project_id = $2
    RETURNING *;
  `;

  try {
    const { rows } = await db.query(query, [userId, projectId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error deleting volunteer assignment:", error);
    throw error;
  }
};

/**
 * ======================================================
 * EXPORTS
 * ======================================================
 */

export { createUser ,
     findUserByEmail, 
     findUserById, getAllUsers, 
     verifyPassword , authenticateUser , 
     requireLogin ,getAllRoles,
      updateUserRole,
     getProjectVolunteers,
     getVolunteerProjects,
     isVolunteerAssigned,
     getVolunteerByUserAndProject,
     volunteeRegistration,
      deleteVolunteerAssignment
    };