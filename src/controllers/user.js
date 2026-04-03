import bcrypt from 'bcrypt';

import { createUser,authenticateUser, getAllUsers,findUserById ,getAllRoles, updateUserRole } from '../models/user.js';

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the user in the database
        const userId = await createUser(name, email, passwordHash);

        // Redirect to the login page after successful registration
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

//  Authenticate user credentials and return user info if valid
const showLoginForm = (req, res) => {
    res.render('register', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }
    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

//  require Role based access control for dashboard

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * 
 * @param {string} role - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (role) => {
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        // Check if user's role matches the required role
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        // User has required role, continue
        next();
    };
};
 
const showDashboard = (req, res) => {
    const user = req.session.user;
    res.render('dashboard/dashboard-index', { 
        title: 'Dashboard' || 'User Dashboard',
        name: user.name || 'No name provided',
        role: user.role_name || 'User',
        email: user.email  ||  'No email provided'
    });
};

const showAdminDashboard = (req, res) => {
    const user = req.session.user;
    res.render('dashboard/admin-dashboard', {
        title: `${user.role_name} Dashboard`,
        name: user.name || 'No name provided',
        role: user.role_name || 'User',
        email: user.email  ||  'No email provided'
    });
};



/**
 * Show Admin Users Page
 */
const showAdminUsersPage = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.render('dashboard/admin-users', {
      title: 'Admin Users',
      name: req.session.user.name || 'No name provided',
      role: req.session.user.role_name || 'User',
      email: req.session.user.email || 'No email provided',
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// Show Admin User Role Update Page
const showAdminUserRoleUpdatePage = async (req, res) => {
    const user = req.session.user;
    const userId = req.params.id;
    const userToEdit = await findUserById(userId);
    const roles = await getAllRoles();
    res.render('dashboard/admin-user-role-update', {
        title: 'Update User Role',
        name: user.name || 'No name provided',
        role: user.role_name || 'User',
        email: user.email || 'No email provided',
        userToEdit,
        roles
    });
}
const processAdminUserRoleUpdatePage = async (req, res) => {
    const userId = req.params.id;
    const { roleId } = req.body;
    try {
        
        await updateUserRole(userId, roleId);
        req.flash('success', 'User role updated successfully!');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error updating user role:', error);
        req.flash('error', 'An error occurred while updating the user role.');
        res.redirect('/admin/users');

    }
}


export { showUserRegistrationForm,
     processUserRegistrationForm, 
     showLoginForm, 
     processLoginForm,
      processLogout,requireRole, showDashboard, showAdminDashboard ,
       showAdminUsersPage, showAdminUserRoleUpdatePage, processAdminUserRoleUpdatePage};