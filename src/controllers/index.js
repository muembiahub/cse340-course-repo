// Import any needed model functions (none are needed for the home page, so this is empty)

// Define any controller functions
const showHomePage = async (req, res) => {
    const title = 'Home';
    res.render('home', { 
        title,
        role: res.locals.user ? res.locals.user.role_name : null

     });
};

// Export any controller functions
export { showHomePage };