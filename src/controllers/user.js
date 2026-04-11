import bcrypt from 'bcrypt';
import { body, validationResult} from 'express-validator';

import { createUser,authenticateUser,
     getAllUsers,findUserById ,
     getAllRoles, 
     updateUserRole,
     getVolunteerByUserAndProject,
     registerVolunteer,
     getVolunteerProjects,
      deleteVolunteerAssignment,
      updateVolunteerAssignment
     } from '../models/user.js';
import { getProjectsDetails} from '../models/projects.js';


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




// =======================================================
// VOLUNTEER REGISTRATION VALIDATION
// =======================================================

const ROLE_TYPES = [
  "Administrative Support",
  "Event Volunteer",
  "Fundraising Volunteer",
  "Mentor / Tutor",
  "Healthcare Support",
  "Technical Volunteer",
  "Community Outreach",
  "Environmental Volunteer"
];

const volunteerValidation = [

  // Project
  body("projectId")
    .notEmpty()
    .withMessage("Project is required"),

  // Role type
  body("roleType")
    .notEmpty()
    .withMessage("Role type is required")
    .isIn(ROLE_TYPES)
    .withMessage("Invalid role type selected"),

  // Hours committed
  body("hoursCommitted")
    .notEmpty()
    .withMessage("Hours committed is required")
    .isInt({ min: 1 })
    .withMessage("Hours must be at least 1")
    .toInt(),

  // Start date
  body("dateToStart")
    .notEmpty()
    .withMessage("Date to start is required")
    .isISO8601()
    .withMessage("Date must be a valid date")
];

// =======================================================
// VOLUNTEER LIST PAGE
// =======================================================
const showVolunteerListPage = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).render("errors/401", {
        title: "Unauthorized",
        message: "You must be logged in to view your volunteer list"
      });
    }

    const volunteers = await getVolunteerProjects(user.user_id);

    res.render("dashboard/volunteer-list", {
      title: "Volunteer List",
      volunteers
    });
  } catch (error) {
    console.error("Error retrieving volunteers:", error);
    req.flash("error", "An error occurred while retrieving volunteers.");
    res.redirect("/dashboard");
  }
};

// =======================================================
// SHOW VOLUNTEER REGISTRATION FORM (CREATE / EDIT)
// =======================================================
const showVolunteerRegistrationForm = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).render("errors/401", {
        title: "Unauthorized",
        message: "You must be logged in to continue"
      });
    }

    const projectId = parseInt(req.params.projectId, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).render("errors/400", {
        title: "Invalid Request",
        message: "Invalid project ID"
      });
    }

    const project = await getProjectsDetails(projectId);
    if (!project) {
      return res.status(404).render("errors/404", {
        title: "Not Found",
        message: "Project not found"
      });
    }

    const volunteer = await getVolunteerByUserAndProject(user.user_id, projectId);
    const mode = volunteer ? "edit" : "create";

    res.render("partials/volunteer-registration", {
      title: mode === "edit"
        ? "Edit Volunteer Assignment"
        : "Volunteer Registration",
      user,
      project,
      volunteer,
      mode
    });
  } catch (error) {
    console.error("Error loading volunteer form:", error);
    res.status(500).render("errors/500", {
      title: "Server Error",
      message: "Unable to load volunteer registration form"
    });
  }
};
// =======================================================
// PROCESS VOLUNTEER REGISTRATION FORM (CREATE)
// =======================================================
const processVolunteerRegistrationForm = async (req, res) => {
  try {
    // ---------------------------------------------------
    // 1. Check authentication
    // ---------------------------------------------------
    const user = req.session.user;
    if (!user) {
      return res.redirect("/login");
    }

    // ---------------------------------------------------
    // 2. Extract and validate project ID
    // ---------------------------------------------------
    const projectId = parseInt(req.body.projectId, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).render("errors/400", {
        title: "Invalid Request",
        message: "Invalid project ID"
      });
    }

    // ---------------------------------------------------
    // 3. Reload project from database
    // ---------------------------------------------------
    const project = await getProjectsDetails(projectId);
    if (!project) {
      return res.status(404).render("errors/404", {
        title: "Not Found",
        message: "Project not found"
      });
    }

    // ---------------------------------------------------
    // 4. Validate form input
    // ---------------------------------------------------
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("partials/volunteer-registration", {
        title: "Volunteer Registration",
        mode: "create",
        user,
        project,
        volunteer: req.body,      // refill form
        errors: errors.array()
      });
    }

    const { roleType, hoursCommitted, dateToStart } = req.body;

    // ---------------------------------------------------
    // 5. Prevent duplicate registration
    // ---------------------------------------------------
    const existingAssignment =
      await getVolunteerByUserAndProject(user.user_id, projectId);

    if (existingAssignment) {
      return res.status(400).render("partials/volunteer-registration", {
        title: "Volunteer Registration",
        mode: "create",
        user,
        project,
        volunteer: req.body,
      });
    req.flash("error", "You are already registered for this project. Please edit your existing registration if you want to make changes.");

    }

      // ---------------------------------------------------
    // 6. Create volunteer registration
    // ---------------------------------------------------
    await registerVolunteer(
      user.user_id,
      projectId,
      roleType,
      hoursCommitted,
      "Pending",
      dateToStart
    );

    // ---------------------------------------------------
    // 7. Redirect on success
    // ---------------------------------------------------
    req.flash("success", "Volunteer registration successful!");
    return res.redirect("/dashboard/volunteer");

  } catch (err) {
    console.error("Error processing volunteer registration:", err);

    return res.status(500).render("errors/500", {
      title: "Server Error",
      message: "Unable to process volunteer registration",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : null
    });
  }
};


// ---------------------------------------------------
// PROCESS VOLUNTEER UPDATE (EDIT MODE)
// ---------------------------------------------------
const processVolunteerUpdateForm = async (req, res) => {
  try {
    // 1️⃣ Authentication check
    const user = req.session.user;
    if (!user) {
      return res.status(401).render("errors/401", {
        title: "Unauthorized",
        message: "You must be logged in to continue"
      });
    }

    // 2️⃣ Validate project ID
    const projectId = parseInt(req.params.projectId, 10);
    if (Number.isNaN(projectId)) {
      req.flash("error", "Invalid project ID.");
      return res.redirect("/dashboard/volunteer");
    }

    // 3️⃣ Extract form data
    const { roleType, hoursCommitted, dateToStart, mode } = req.body;

    // 4️⃣ Ensure correct mode
    if (mode !== "edit") {
      req.flash("error", "Invalid operation.");
      return res.redirect("/dashboard/volunteer");
    }

    // 5️⃣ Update volunteer assignment
    await updateVolunteerAssignment(
      user.user_id,
      projectId,
      roleType,
      parseInt(hoursCommitted, 10),
      "Pending",           // status reset after edit
      dateToStart
    );

    // 6️⃣ Success feedback
    req.flash("success", "Volunteer assignment updated successfully!");
    return res.redirect("/dashboard/volunteer");

  } catch (error) {
    console.error("Error updating volunteer assignment:", error);

    req.flash(
      "error",
      "Something went wrong while updating your volunteer assignment."
    );
    return res.redirect("/dashboard/volunteer");
  }
};


// =======================================================
// DELETE VOLUNTEER ASSIGNMENT
// =======================================================
const processVolunteerDeleteprojectId = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).render("errors/401", {
        title: "Unauthorized",
        message: "You must be logged in to delete a volunteer assignment"
      });
    }

    const projectId = parseInt(req.params.projectId, 10);
    if (Number.isNaN(projectId)) {
      req.flash("error", "Invalid project ID.");
      return res.redirect("/dashboard/volunteer");
    }

    const deleted =
      await deleteVolunteerAssignment(user.user_id, projectId);

    if (!deleted) {
      req.flash("error", "No volunteer assignment found to delete.");
    } else {
      req.flash("success", "Volunteer assignment deleted successfully.");
    }

    res.redirect("/dashboard/volunteer");
  } catch (error) {
    console.error("Error deleting volunteer assignment:", error);
    req.flash("error", "Unable to delete volunteer assignment.");
    res.redirect("/dashboard/volunteer");
  }
};

//  validation middleware for volunteer registration form and edit form



// =======================================================

export { showUserRegistrationForm,
     processUserRegistrationForm, 
     showLoginForm, 
     processLoginForm,
      processLogout,requireRole, showDashboard, showAdminDashboard ,
       showAdminUsersPage, showAdminUserRoleUpdatePage,
        processAdminUserRoleUpdatePage,
        showVolunteerListPage,
        showVolunteerRegistrationForm,
        processVolunteerRegistrationForm,
        processVolunteerUpdateForm,
        processVolunteerDeleteprojectId,
        volunteerValidation
    };