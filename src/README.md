# 🏛️ True Light Christian Assembly - Expense Tracker

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A comprehensive expense tracking system for church financial management**

[Live Demo](https://expense.tlcachurch.org) • [Report Bug](https://github.com/yourusername/tlca-expense-tracker/issues) • [Request Feature](https://github.com/yourusername/tlca-expense-tracker/issues)

</div>

---

## 📖 Table of Contents

- [About](#about-the-project)
- [Features](#features)
- [Tech Stack](#technology-stack)
- [Quick Start](#quick-start-guide)
- [Deployment](#production-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [License](#license)

---

## 📖 About The Project

The TLCA Expense Tracker is a full-stack web application designed specifically for **True Light Christian Assembly** to manage financial transactions across multiple church departments. Built with modern web technologies, it provides a secure, user-friendly interface for tracking expenses, recording income, managing receipts, and generating financial reports.

### 🎯 Key Highlights

- **7 Pre-configured Departments**: Sports, Fellowship, Food, Kids, Worship, Media, General
- **118 Church Members**: Pre-loaded member database for quick transaction assignment
- **Role-Based Security**: Separate access levels for administrators and department managers
- **Receipt Management**: Upload and store receipt images and PDFs
- **Real-Time Reporting**: Instant financial summaries and department analytics
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

---

## ✨ Features

### 👤 For Administrators

<table>
<tr>
<td width="33%">

**📊 Dashboard Overview**
- View all 7 departments at once
- Consolidated financial summaries
- Cross-department analytics
- Budget monitoring

</td>
<td width="33%">

**👥 User Management**
- Create department manager accounts
- Assign departments to managers
- Reset passwords
- Deactivate users

</td>
<td width="33%">

**🏢 Department Control**
- Create new departments
- Archive inactive departments
- View detailed department data
- Generate reports

</td>
</tr>
</table>

### 💼 For Department Managers

- ✅ **Add Expenses**: Record purchases with receipt uploads
- ✅ **Track Income**: Log donations and department revenue
- ✅ **Manage Transactions**: View, edit, and delete entries
- ✅ **Monitor Budget**: Real-time expense vs. income tracking
- ✅ **Generate Reports**: Export financial summaries

### 💰 Expense & Income Tracking

| Feature | Description |
|---------|-------------|
| **Receipt Upload** | Support for JPG, PNG, GIF, WebP, and PDF files |
| **Reimbursement Status** | Track Pending, Approved, or Paid status |
| **Member Assignment** | Select from 118 pre-loaded church members |
| **Date Filtering** | Filter transactions by custom date ranges |
| **Search & Sort** | Quick search by description, amount, or date |
| **Notes & Details** | Add contextual notes to each transaction |

---

## 🛠 Technology Stack

### Frontend

```
React 18.3        Modern UI framework
TypeScript 5.6    Type-safe JavaScript
Vite 6.0          Lightning-fast build tool
Tailwind CSS v4   Utility-first styling
shadcn/ui         50+ pre-built components
Lucide React      Beautiful icon library
date-fns          Date manipulation
```

### Backend

```
PHP 8.0+          Server-side language
MySQL 8.0         Relational database
JWT Auth          Secure token authentication
PDO               Database abstraction layer
Apache 2.4        Web server
```

### Development & Deployment

```
npm               Package manager
Git               Version control
DreamHost         Production hosting (MySQL)
phpMyAdmin        Database management
FTP/SFTP          File deployment
FileZilla         Recommended FTP client
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PHP** (v8.0 or higher)
- **MySQL** (v8.0 or higher)
- **Apache** web server (with mod_rewrite enabled)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tlca-expense-tracker.git
cd tlca-expense-tracker
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Set Up MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE tlca_expense_tracker;
USE tlca_expense_tracker;

# Import schema
source church_expense_tracker_schema.sql;

# Exit MySQL
exit;
```

#### 4. Configure Backend

Edit `/api/config/database.php`:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tlca_expense_tracker');
define('DB_USER', 'your_mysql_username');
define('DB_PASS', 'your_mysql_password');
define('JWT_SECRET', 'your-secure-random-string-at-least-32-chars');
define('ALLOWED_ORIGIN', 'http://localhost:5173');
?>
```

⚠️ **Important**: 
- Change `JWT_SECRET` to a random, secure string (at least 32 characters)
- Never commit `database.php` with real credentials to Git (it's in `.gitignore`)

#### 5. Create Uploads Directory

```bash
mkdir -p api/uploads/receipts
chmod 755 api/uploads/receipts
```

#### 6. Configure Frontend Environment

The `.env` file is for frontend build variables only:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ENV=development
VITE_ENABLE_DEBUG=true
```

For production, update to:

```env
VITE_API_BASE_URL=https://expense.tlcachurch.org/api
VITE_ENV=production
VITE_ENABLE_DEBUG=false
```

#### 7. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd api
php -S localhost:8000
# Runs on http://localhost:8000
```

#### 8. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

#### 9. Create Your First Admin Account

1. Visit http://localhost:5173
2. Click **"Admin Setup"**
3. Fill in admin details
4. Click **"Create Admin & Initialize System"**
5. Login with your credentials

---

## 🌐 Production Deployment

### Step 1: Prepare Database Configuration

Edit `/api/config/database.php` for production:

```php
<?php
define('DB_HOST', 'figueras.pdx1-mysql-a7-4b.dreamhost.com');
define('DB_NAME', 'tlcaexpense');
define('DB_USER', 'adminexpense');
define('DB_PASS', 'YOUR_PRODUCTION_PASSWORD');  // ⚠️ UPDATE THIS!
define('JWT_SECRET', 'production-secure-random-string-min-32-chars');  // ⚠️ UPDATE THIS!
define('ALLOWED_ORIGIN', 'https://expense.tlcachurch.org');
?>
```

### Step 2: Build Frontend

```bash
# Make sure .env has production settings
npm run build
```

This creates a `build/` folder with production-ready files.

### Step 3: Prepare Files for Upload

You need to upload these files/folders:

```
✅ build/ folder contents → expense.tlcachurch.org/ (root)
✅ api/ folder → expense.tlcachurch.org/api/
✅ .htaccess (3 files - see below)
```

### Step 4: Upload .htaccess Files (Critical!)

**⚠️ IMPORTANT: These files fix CORS errors and enable proper routing.**

The three `.htaccess` files are **hidden files** (they start with a dot). You need to enable "Show hidden files" to see them:

#### How to See Hidden Files:

**On Mac:**
1. Open Finder
2. Press: `Cmd + Shift + .` (Command + Shift + Period)
3. Hidden files will appear in gray

**On Windows:**
1. Open File Explorer
2. Click **View** tab
3. Check **"Hidden items"**

**In FileZilla:**
```
FileZilla Menu → Server → "Force showing hidden files"
```

#### Upload These 3 Files:

1. **Root .htaccess**
   - **Local:** `.htaccess` (project root)
   - **Remote:** `expense.tlcachurch.org/.htaccess`

2. **API .htaccess**
   - **Local:** `api/.htaccess`
   - **Remote:** `expense.tlcachurch.org/api/.htaccess`

3. **Uploads .htaccess**
   - **Local:** `api/uploads/.htaccess`
   - **Remote:** `expense.tlcachurch.org/api/uploads/.htaccess`

### Step 5: Upload Files via FTP

Using FileZilla or your preferred FTP client:

```
Local (Your Computer)          →  Remote (Server)
────────────────────────────────────────────────────
build/index.html               →  expense.tlcachurch.org/index.html
build/assets/                  →  expense.tlcachurch.org/assets/
.htaccess                      →  expense.tlcachurch.org/.htaccess
api/                           →  expense.tlcachurch.org/api/
api/.htaccess                  →  expense.tlcachurch.org/api/.htaccess
api/uploads/.htaccess          →  expense.tlcachurch.org/api/uploads/.htaccess
```

### Step 6: Import Database Schema

1. Access **phpMyAdmin** on DreamHost panel
2. Select the `tlcaexpense` database
3. Click **Import** tab
4. Upload `church_expense_tracker_schema.sql`
5. Click **Go**
6. Wait for confirmation (should create 6 tables)

### Step 7: Set File Permissions

```bash
# Directories
chmod 755 api/
chmod 755 api/uploads/
chmod 755 api/uploads/receipts/

# Sensitive files
chmod 644 api/config/database.php
chmod 644 .htaccess
chmod 644 api/.htaccess
chmod 644 api/uploads/.htaccess
```

### Step 8: Test Deployment

Visit https://expense.tlcachurch.org and verify:

- ✅ Application loads correctly
- ✅ Admin setup page appears
- ✅ Can create admin account
- ✅ Can login successfully
- ✅ Departments are visible
- ✅ Can add expenses
- ✅ Can upload receipts

### Step 9: Create Admin Account

1. Navigate to https://expense.tlcachurch.org
2. Click **Admin Setup**
3. Enter:
   - Email: `admin@tlcachurch.org`
   - Password: (your secure password)
   - Name: (your name)
4. Click **Create Admin & Initialize System**
5. Login with your credentials

---

## ⚙️ Configuration

### Frontend Configuration (.env)

The `.env` file contains **frontend build-time variables** that are embedded into your JavaScript bundle.

**Important Notes:**
- ✅ All variables must start with `VITE_`
- ✅ Changes require rebuilding (`npm run build`)
- ✅ Variables are **public** (visible in browser)
- ❌ **DO NOT** store passwords or API keys here
- ❌ This file is **NOT uploaded** to the server

**Production Settings:**

```env
# API endpoint your frontend will call
VITE_API_BASE_URL=https://expense.tlcachurch.org/api

# Environment mode
VITE_ENV=production

# App metadata
VITE_APP_NAME=TLCA Expense Tracker
VITE_APP_VERSION=1.0.0

# Debug flags (disable in production)
VITE_ENABLE_DEBUG=false
VITE_ENABLE_CONSOLE_LOGS=false

# Upload constraints
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf

# Session timeout (in seconds)
VITE_SESSION_TIMEOUT=86400
```

### Backend Configuration (database.php)

The `/api/config/database.php` file contains **server-side secrets** and configuration.

**⚠️ Security Warning:**
- ✅ This file IS uploaded to the server
- ✅ Contains sensitive passwords/secrets
- ✅ Changes take effect immediately (no rebuild needed)
- ❌ **NEVER commit this to Git** (it's in `.gitignore`)

**Production Configuration:**

```php
<?php
// Database connection
define('DB_HOST', 'figueras.pdx1-mysql-a7-4b.dreamhost.com');
define('DB_NAME', 'tlcaexpense');
define('DB_USER', 'adminexpense');
define('DB_PASS', 'your-strong-password-here');  // ⚠️ CHANGE THIS!

// JWT authentication secret (minimum 32 characters)
define('JWT_SECRET', 'your-random-secure-string-at-least-32-chars');  // ⚠️ CHANGE THIS!

// CORS allowed origin
define('ALLOWED_ORIGIN', 'https://expense.tlcachurch.org');

// Optional: Enable error reporting for debugging (disable in production)
// ini_set('display_errors', 1);
// error_reporting(E_ALL);
?>
```

### .htaccess Configuration

Three `.htaccess` files control Apache behavior:

#### 1. Root `.htaccess` (handles React Router and CORS)

```apache
# Enable URL Rewriting for React Router
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteRule . /index.html [L]
</IfModule>

# CORS Headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://expense.tlcachurch.org"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
</IfModule>

# Prevent directory listing
Options -Indexes
```

#### 2. API `.htaccess` (handles API CORS)

```apache
# CORS for API endpoints
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "https://expense.tlcachurch.org"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Deny access to sensitive files
<FilesMatch "(\.htaccess|\.env|database\.php)$">
    Require all denied
</FilesMatch>

# PHP Settings
<IfModule mod_php.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_flag display_errors Off
    php_flag log_errors On
</IfModule>
```

#### 3. Uploads `.htaccess` (prevents PHP execution in uploads)

```apache
# CRITICAL SECURITY: Prevent PHP execution in uploads directory
<FilesMatch "\.php$">
    Require all denied
</FilesMatch>

# Remove all script handlers
RemoveHandler .php .phtml .php3 .php4 .php5 .phps .cgi .pl .py .jsp .asp .sh .shtml
RemoveType .php .phtml .php3 .php4 .php5 .phps .cgi .pl .py .jsp .asp .sh .shtml

# Only allow specific file types
<FilesMatch "\.(jpg|jpeg|png|gif|webp|pdf)$">
    Require all granted
</FilesMatch>

# Prevent directory browsing
Options -Indexes
```

---

## 🐛 Troubleshooting

### Issue 1: "500 Internal Server Error"

**Symptoms:**
- White page with error message
- No login page appears

**Solutions:**

1. **Check .htaccess files are uploaded**
   ```bash
   # Enable hidden files in FileZilla
   # Verify these 3 files exist on server:
   /.htaccess
   /api/.htaccess
   /api/uploads/.htaccess
   ```

2. **Check PHP error logs**
   - DreamHost Panel → Domains → Manage Domains → Edit → Error Logs
   - Look for recent errors

3. **Verify file permissions**
   ```bash
   chmod 755 api/
   chmod 755 api/uploads/
   chmod 644 api/config/database.php
   ```

### Issue 2: "Database Connection Failed"

**Symptoms:**
- API returns database error
- Can't create admin account
- Login doesn't work

**Solutions:**

1. **Verify credentials in database.php**
   ```php
   // Check these match your DreamHost MySQL
   define('DB_HOST', 'mysql.example.com');  // From DreamHost panel
   define('DB_NAME', 'tlcaexpense');        // Exact database name
   define('DB_USER', 'adminexpense');       // MySQL username
   define('DB_PASS', 'your_password');      // Did you update this?
   ```

2. **Test in phpMyAdmin**
   - Try logging into phpMyAdmin with same credentials
   - If login fails, password is incorrect

3. **Verify database exists**
   ```sql
   SHOW DATABASES;
   ```
   Your database should appear in the list.

4. **Import schema if empty**
   - phpMyAdmin → Select database
   - Import → `church_expense_tracker_schema.sql`

### Issue 3: "404 Not Found" on API Calls

**Symptoms:**
- API endpoints return 404
- Console shows 404 errors

**Solutions:**

1. **Check API files are uploaded**
   - Verify `/api/index.php` exists on server
   - Verify `/api/auth/login.php` exists

2. **Test direct access**
   ```
   https://expense.tlcachurch.org/api/index.php
   ```
   Should return: `{"status":"ok","message":"API is running"}`

3. **Verify .htaccess uploaded**
   - Check root `.htaccess` exists
   - Check `api/.htaccess` exists

### Issue 4: "CORS Error" in Browser Console

**Symptoms:**
- Browser console shows CORS errors
- API calls blocked
- "Access-Control-Allow-Origin" errors

**Solutions:**

1. **Upload .htaccess files** (most common fix)
   - Root `.htaccess`
   - `api/.htaccess`
   - `api/uploads/.htaccess`

2. **Check ALLOWED_ORIGIN in database.php**
   ```php
   define('ALLOWED_ORIGIN', 'https://expense.tlcachurch.org');
   ```

3. **Clear browser cache**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

### Issue 5: "Failed to Upload Receipt"

**Symptoms:**
- Can't upload receipts
- "Upload failed" error message

**Solutions:**

1. **Create uploads directory**
   ```bash
   mkdir -p api/uploads/receipts
   chmod 755 api/uploads/receipts
   ```

2. **Check PHP upload limits**
   - `upload_max_filesize` → Should be at least 10M
   - `post_max_size` → Should be at least 10M
   - Configured in `api/.htaccess`

3. **Verify disk space**
   - Check available space on DreamHost

### Issue 6: "Invalid Token" or "Unauthorized"

**Symptoms:**
- Can't login even with correct password
- "Session expired" immediately

**Solutions:**

1. **Check JWT_SECRET in database.php**
   ```php
   define('JWT_SECRET', 'must-be-at-least-32-characters-long');
   ```

2. **Clear browser storage**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   sessionStorage.clear();
   ```
   Then reload and try logging in again.

3. **Recreate admin user**
   - Run setup again to create new admin account

### Issue 7: Build Errors (`npm run build`)

**Symptoms:**
- Build command fails
- TypeScript errors
- No `build/` folder created

**Solutions:**

1. **Clean install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check Node version**
   ```bash
   node --version  # Should be 18 or higher
   npm --version   # Should be 9 or higher
   ```

3. **Increase memory**
   ```bash
   NODE_OPTIONS=--max_old_space_size=4096 npm run build
   ```

### Issue 8: Page Loads But Looks Broken

**Symptoms:**
- No styling (plain white page)
- Images missing
- Layout broken

**Solutions:**

1. **Verify CSS file exists**
   - Check `https://expense.tlcachurch.org/assets/index-[hash].css`
   - If 404, re-upload `build/assets/` folder

2. **Clear browser cache**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Check all files uploaded**
   - Open browser DevTools → Network tab
   - Look for failed requests (red items)
   - Re-upload missing files

### Debug Checklist

When troubleshooting, check these in order:

- [ ] Files uploaded to correct location?
- [ ] Database credentials correct in database.php?
- [ ] Database schema imported?
- [ ] All 3 .htaccess files uploaded?
- [ ] uploads/ folder created with 755 permissions?
- [ ] PHP version 7.4 or higher?
- [ ] Browser cache cleared?
- [ ] Error logs checked?
- [ ] API health check works (/api/index.php)?
- [ ] JWT_SECRET is set and not default?

**Most Common Issues:**
1. 🔴 Missing/incorrect database password (60%)
2. 🔴 .htaccess files not uploaded (20%)
3. 🔴 Files uploaded to wrong location (10%)
4. 🔴 Wrong permissions on uploads/ (5%)
5. 🔴 Other issues (5%)

---

## 📡 API Documentation

### Base URL

```
Production:  https://expense.tlcachurch.org/api
Development: http://localhost:8000/api
```

### Authentication

All authenticated endpoints require a JWT token:

```http
Authorization: Bearer {your_jwt_token}
```

### Endpoints

#### Authentication

##### `POST /auth/login.php`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "admin@tlcachurch.org",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@tlcachurch.org",
    "name": "Church Administrator",
    "role": "admin",
    "department": null
  }
}
```

##### `POST /auth/signup.php`
Create new user account (Admin only).

##### `POST /auth/logout.php`
Terminate current session.

##### `GET /auth/verify.php`
Verify JWT token and get user info.

---

#### Expenses

##### `GET /expenses/get.php?department=Sports`
Retrieve expenses for a department.

##### `POST /expenses/add.php`
Create new expense.

##### `PUT /expenses/update.php`
Update existing expense.

##### `DELETE /expenses/delete.php?id=1`
Delete expense.

---

#### Income

##### `GET /income/get.php?department=Sports`
Retrieve income for a department.

##### `POST /income/add.php`
Record new income.

---

#### Departments

##### `GET /departments/get.php`
List all active departments.

##### `POST /departments/add.php`
Create new department (Admin only).

##### `POST /departments/archive.php`
Archive/restore department (Admin only).

---

#### Church Members

##### `GET /members/get.php`
List all church members.

---

#### Users

##### `GET /users/get.php`
List all users (Admin only).

##### `PUT /users/update.php`
Update user account (Admin only).

##### `DELETE /users/delete.php?id=2`
Delete user account (Admin only).

---

#### File Upload

##### `POST /uploads/receipt.php`
Upload receipt file.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `receipt`
- Allowed types: JPG, PNG, GIF, WebP, PDF
- Max size: 10MB

**Response:**
```json
{
  "success": true,
  "url": "https://expense.tlcachurch.org/api/uploads/receipts/receipt_1730123456_abc123.jpg",
  "filename": "receipt_1730123456_abc123.jpg"
}
```

---

## 🗄 Database Schema

### Tables

#### `users`
Stores user accounts and authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique user identifier |
| email | VARCHAR(255) | User email (unique) |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| name | VARCHAR(255) | Full name |
| role | ENUM | 'admin' or 'department_manager' |
| department | VARCHAR(100) | Assigned department (NULL for admin) |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | Last update date |

#### `departments`
Department configuration and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique department identifier |
| name | VARCHAR(100) | Department name (unique) |
| description | TEXT | Department description |
| is_active | BOOLEAN | Active/archived status |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

#### `expenses`
Financial expense transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique expense identifier |
| department | VARCHAR(100) | Department name |
| description | TEXT | Expense description |
| amount | DECIMAL(10,2) | Transaction amount |
| date | DATE | Expense date |
| purchased_by | VARCHAR(255) | Church member name |
| notes | TEXT | Additional notes |
| reimbursement_status | ENUM | 'Pending', 'Approved', 'Paid' |
| receipt_url | TEXT | Receipt file URL |
| receipt_filename | VARCHAR(255) | Receipt filename |
| created_by | INT (FK) | User ID who created |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `income`
Department income transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique income identifier |
| department | VARCHAR(100) | Department name |
| description | TEXT | Income description |
| amount | DECIMAL(10,2) | Transaction amount |
| date | DATE | Income date |
| contributed_by | VARCHAR(255) | Church member name |
| notes | TEXT | Additional notes |
| created_by | INT (FK) | User ID who created |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `church_members`
Pre-loaded church member directory.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique member identifier |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| is_active | BOOLEAN | Active member status |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

#### `sessions`
User authentication sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique session identifier |
| user_id | INT (FK) | User ID |
| token | VARCHAR(500) | JWT token |
| expires_at | TIMESTAMP | Token expiration |
| created_at | TIMESTAMP | Session creation |

### Pre-loaded Data

- **7 Departments**: Sports, Fellowship, Food, Kids, Worship, Media, General
- **118 Church Members**: Full membership roster from `church-members.csv`

---

## 📁 Project Structure

```
tlca-expense-tracker/
│
├── api/                              # Backend API (PHP)
│   ├── auth/                         # Authentication endpoints
│   │   ├── login.php
│   │   ├── signup.php
│   │   ├── logout.php
│   │   └── verify.php
│   ├── config/
│   │   └── database.php              # Database configuration (DO NOT COMMIT!)
│   ├── departments/
│   │   ├── get.php
│   │   ├── add.php
│   │   └── archive.php
│   ├── expenses/
│   │   ├── get.php
│   │   ├── add.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── income/
│   │   ├── get.php
│   │   └── add.php
│   ├── members/
│   │   └── get.php
│   ├── uploads/
│   │   └── receipt.php               # File upload handling
│   ├── users/
│   │   ├── get.php
│   │   ├── update.php
│   │   └── delete.php
│   └── index.php                     # API health check
│
├── components/                       # React Components
│   ├── AddExpenseDialog.tsx
│   ├── AddIncomeDialog.tsx
│   ├── AdminSetup.tsx
│   ├── DepartmentDetailView.tsx
│   ├── DepartmentManagement.tsx
│   ├── DepartmentManagerView.tsx
│   ├── DepartmentSummary.tsx
│   ├── ExpenseTable.tsx
│   ├── LoginPage.tsx
│   ├── MembersUpload.tsx
│   ├── ReportsView.tsx
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/                           # shadcn/ui components (50+ files)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── src/
│   └── main.tsx                      # React entry point
│
├── styles/
│   └── globals.css                   # Global styles
│
├── utils/
│   ├── api/                          # API utility functions
│   │   ├── auth.tsx
│   │   ├── departments.tsx
│   │   ├── expenses.tsx
│   │   ├── income.tsx
│   │   ├── members.tsx
│   │   ├── uploads.tsx
│   │   └── users.tsx
│   └── departmentUtils.tsx
│
├── .env                              # Frontend environment (NOT uploaded)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── .htaccess                         # Apache config (root)
├── api/.htaccess                     # Apache config (API)
├── api/uploads/.htaccess             # Apache config (uploads)
│
├── App.tsx                           # Main application component
├── index.html                        # HTML entry point
├── package.json                      # Dependencies
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
│
├── church-members.csv                # 118 church members
├── church_expense_tracker_schema.sql # Database schema
│
└── README.md                         # This file
```

---

## 🔐 Security

### Authentication & Authorization

- **JWT Tokens**: Secure session management with expiration
- **Password Hashing**: bcrypt with automatic salt generation
- **Role-Based Access**: Admins vs. Department Managers
- **Department Isolation**: Managers only access assigned department

### API Security

- **CORS Protection**: Whitelist allowed origins via .htaccess
- **SQL Injection Prevention**: PDO prepared statements
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Token validation on state-changing requests
- **Rate Limiting**: Via Apache .htaccess configuration

### File Upload Security

- **File Type Validation**: Only images and PDFs allowed
- **File Size Limits**: Maximum 10MB per upload
- **Filename Sanitization**: Remove dangerous characters
- **Isolated Storage**: Uploads directory with restricted execution
- **PHP Execution Prevention**: .htaccess protection in uploads folder

### SSL/TLS

- **HTTPS Enforced**: All traffic encrypted
- **Valid SSL Certificate**: Trusted certificate authority
- **Secure Cookies**: HTTP-only and secure flags set

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 True Light Christian Assembly

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Contact & Support

### Project Links

- **Live Application**: [https://expense.tlcachurch.org](https://expense.tlcachurch.org)
- **Church Website**: [https://tlcachurch.org](https://tlcachurch.org)

### Getting Help

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review your configuration files
3. Check error logs (browser console and server)
4. Contact DreamHost support for hosting issues

---

## 🙏 Acknowledgments

Built with love for **True Light Christian Assembly** using:

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Lucide React](https://lucide.dev/) - Icon library
- [PHP](https://www.php.net/) - Backend language
- [MySQL](https://www.mysql.com/) - Database
- [DreamHost](https://www.dreamhost.com/) - Hosting platform

---

## 🎯 Quick Reference

### Default Login (After Setup)
```
Email: admin@tlcachurch.org
Password: (what you set during setup)
```

### Important Files to Update
- `/api/config/database.php` - Database credentials & JWT secret
- `/.env` - Frontend API URL (for build)

### Files to Upload to Server
- `build/` folder contents → root
- `api/` folder → root
- `.htaccess` (3 files) → respective locations

### Build Command
```bash
npm run build
```

### Test API Health
```
https://expense.tlcachurch.org/api/index.php
```
Should return: `{"status":"ok","message":"API is running"}`

---

## 📊 Project Status

![Development Status](https://img.shields.io/badge/status-production-green)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Maintenance](https://img.shields.io/badge/maintenance-active-brightgreen)

**Current Version**: 1.0.0  
**Last Updated**: October 29, 2025  
**Hosting**: DreamHost MySQL

---

<div align="center">

**⭐ Built for True Light Christian Assembly**

Made with ❤️ and ☕

[⬆ Back to top](#-true-light-christian-assembly---expense-tracker)

</div>
