-- Create the database
CREATE DATABASE daycare_db;

-- Create a user for the application (optional)
CREATE USER daycare_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE daycare_db TO daycare_user;

-- Connect to the database
\c daycare_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO daycare_user;
