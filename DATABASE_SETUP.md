# Database Setup Guide for FitZone

This guide will help you set up either MongoDB or MySQL database for your FitZone fitness website.

## Prerequisites

- Node.js installed on your machine
- Either MongoDB or MySQL installed locally

## Option 1: MongoDB Setup (Recommended)

### 1. Install MongoDB

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell prompt
# Type 'exit' to quit
```

### 3. Configure Environment Variables

Update your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/fitzone
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
PORT=5000
NODE_ENV=development
```

### 4. Start the Server

```bash
# Install additional dependencies
npm install nodemon --save-dev

# Start the backend server
npm run server

# Or for development with auto-restart
npx nodemon server/index.js
```

## Option 2: MySQL Setup

### 1. Install MySQL

**Windows:**
1. Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
2. Run the installer and follow the setup wizard
3. Remember the root password you set during installation

**macOS:**
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Secure installation
mysql_secure_installation
```

**Linux (Ubuntu):**
```bash
# Update package index
sudo apt update

# Install MySQL
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database and User

```bash
# Login to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE fitzone;

# Create a user for the application (optional but recommended)
CREATE USER 'fitzone_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON fitzone.* TO 'fitzone_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### 3. Install MySQL Dependencies

```bash
npm install mysql2 --save
```

### 4. Configure Environment Variables

Update your `.env` file:
```env
MYSQL_HOST=localhost
MYSQL_USER=fitzone_user
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=fitzone
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
PORT=5000
NODE_ENV=development
```

### 5. Create Tables

```bash
# Run the MySQL setup script to create tables
node server/mysql-setup.js
```

### 6. Update Server Code for MySQL

If you choose MySQL, you'll need to modify `server/index.js` to use MySQL instead of MongoDB. The current setup uses MongoDB by default.

## Testing the Database Connection

### 1. Start the Backend Server

```bash
# Start the server
npm run server

# You should see:
# ✅ Connected to [MongoDB/MySQL] successfully
# 🚀 Server running on http://localhost:5000
```

### 2. Test API Endpoints

```bash
# Test health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","message":"FitZone API is running","timestamp":"..."}
```

### 3. Start Frontend Development Server

```bash
# In a new terminal, start the React app
npm run dev

# Your app will be available at http://localhost:5173
```

## Database Schema

### MongoDB Collections:
- **users**: User accounts and profiles
- **programs**: Fitness programs and details
- **inquiries**: Contact form submissions
- **memberships**: User membership records

### MySQL Tables:
- **users**: User accounts and profiles
- **programs**: Fitness programs and details
- **user_programs**: Junction table for purchased programs
- **inquiries**: Contact form submissions
- **memberships**: User membership records

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (authenticated)
- `PUT /api/user/profile` - Update user profile (authenticated)
- `POST /api/contact` - Submit contact inquiry
- `GET /api/programs` - Get all programs
- `POST /api/programs/:id/purchase` - Purchase program (authenticated)
- `GET /api/user/programs` - Get user's purchased programs (authenticated)
- `POST /api/memberships` - Create membership (authenticated)

## Troubleshooting

### MongoDB Issues:
1. **Connection refused**: Make sure MongoDB service is running
2. **Permission denied**: Check MongoDB data directory permissions
3. **Port conflicts**: Ensure port 27017 is not used by other applications

### MySQL Issues:
1. **Access denied**: Verify username and password in `.env`
2. **Connection refused**: Make sure MySQL service is running
3. **Database doesn't exist**: Run the table creation script

### General Issues:
1. **Port 5000 in use**: Change PORT in `.env` file
2. **CORS errors**: Make sure both frontend and backend are running
3. **JWT errors**: Ensure JWT_SECRET is set in `.env`

## Next Steps

1. Update the React components to use the API service
2. Implement proper error handling in the frontend
3. Add form validation
4. Set up user authentication state management
5. Add loading states and user feedback

Your database is now ready to use with the FitZone website!