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
//  down  role function =================

const downgradeUserRole = async (userId) => {
    const query = `
    UPDATE users
    SET role_id = (SELECT role_id FROM roles WHERE role_name = 'user')
    WHERE user_id = $1
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}


export { createUser , findUserByEmail, findUserById, getAllUsers, verifyPassword , authenticateUser , requireLogin ,getAllRoles, updateUserRole , downgradeUserRole };