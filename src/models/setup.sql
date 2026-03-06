-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');



-- Table des projets de service 
CREATE TABLE service_projects
 ( project_id SERIAL PRIMARY KEY, 
 organization_id INT NOT NULL, 
 title VARCHAR(150) NOT NULL, 
 description TEXT, 
 location VARCHAR(150), 
 project_date DATE,
 FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) );


--  ==========================  insert data into      ===============================

-- Projets pour Helping Hands
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES
(1, 'Food Drive', 'Collecting food for local families', 'Lubumbashi', '2026-03-15'),
(1, 'Clothing Donation', 'Providing clothes to those in need', 'Kinshasa', '2026-04-10'),
(1, 'Health Camp', 'Free medical checkups', 'Kampemba', '2026-05-05'),
(1, 'School Supplies', 'Distributing supplies to students', 'Kolwezi', '2026-06-01'),
(1, 'Community Cleanup', 'Cleaning public spaces', 'Lubumbashi', '2026-07-20');

-- Projets pour Green Earth
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES
(2, 'Tree Planting', 'Planting trees in urban areas', 'Kinshasa', '2026-03-25'),
(2, 'Recycling Workshop', 'Teaching recycling practices', 'Lubumbashi', '2026-04-15'),
(2, 'River Cleanup', 'Cleaning river banks', 'Kampemba', '2026-05-12'),
(2, 'Eco Awareness Campaign', 'Promoting eco-friendly habits', 'Kolwezi', '2026-06-18'),
(2, 'Solar Energy Demo', 'Showcasing solar solutions', 'Lubumbashi', '2026-07-30');

-- Projets pour Youth Empowerment
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES
(3, 'Coding Bootcamp', 'Teaching programming to youth', 'Kinshasa', '2026-03-28'),
(3, 'Leadership Workshop', 'Training future leaders', 'Lubumbashi', '2026-04-22'),
(3, 'Sports Tournament', 'Organizing youth sports events', 'Kampemba', '2026-05-15'),
(3, 'Scholarship Program', 'Providing scholarships to students', 'Kolwezi', '2026-06-10'),
(3, 'Art Exhibition', 'Showcasing youth creativity', 'Lubumbashi', '2026-07-25');


--  ================================   assignment   ======================================

-- 1. Categories table
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Junction table for many-to-many relationship
CREATE TABLE ServiceProjectsCategories (
    project_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES service_projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);

INSERT INTO Categories (name)
VALUES 
    ('Community Development'),
    ('Education & Training'),
    ('Environmental Sustainability'),
    ('Health and Wellness');


-- Community Service
INSERT INTO ServiceProjectsCategories (project_id, category_id)
VALUES
    (1, 1), -- Food Drive
    (2, 1), -- Clothing Donation
    (5, 1); -- Community Cleanup

-- Health and Wellness
INSERT INTO ServiceProjectsCategories (project_id, category_id)
VALUES
    (3, 4); -- Health Camp

-- Educational
INSERT INTO ServiceProjectsCategories (project_id, category_id)
VALUES
    (4, 2); -- School Supplies

-- Environmental
INSERT INTO ServiceProjectsCategories (project_id, category_id)
VALUES
    (6, 3), -- Tree Planting
    (7, 3), -- Recycling Workshop
    (8, 3), -- River Cleanup
    (9, 3), -- Eco Awareness Campaign
    (10, 3); -- Solar Energy Demo

-- Multi-category associations
INSERT INTO ServiceProjectsCategories (project_id, category_id)
VALUES
    (9, 2), -- Eco Awareness Campaign also Educational
    (10, 2); -- Solar Energy Demo also Educational