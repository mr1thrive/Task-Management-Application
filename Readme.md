# 🗂️ Task Management Application

A full-featured Task Management Application that allows users to create, update, delete, and track tasks with deadlines and progress indicators. The system includes secure authentication and personalized task lists, delivered through a clean and intuitive user interface.

---

## 📌 Overview

This application helps users organize their work and improve productivity by providing a centralized platform for task tracking. Each user can register, log in, and manage their own private task collection. Tasks can be updated over time, assigned deadlines, and marked by progress status.

The project is designed with usability, performance, and scalability in mind.

---

## 🚀 Features

- ✅ User registration and login (authentication)
- ✅ Personalized user dashboards
- ✅ Create new tasks
- ✅ Update existing tasks
- ✅ Delete tasks
- ✅ Set task deadlines
- ✅ Track task progress (e.g., Pending / In Progress / Completed)
- ✅ Password validation and confirmation fields
- ✅ Responsive and intuitive UI
- ✅ Inline form validation
- ✅ Secure session handling

---

## 🧱 Core Functionality

### User Management
- Users can sign up with email and password
- Secure login system
- Password confirmation and validation
- Session-based or token-based authentication

### Task Operations (CRUD)
- Create tasks with title, description, and deadline
- Edit task details anytime
- Delete tasks permanently
- Change task status to reflect progress

### Progress Tracking
- Status labels for each task
- Visual indicators for completion state
- Deadline visibility for prioritization

---

## 🖥️ User Interface

The application UI is designed to be:

- Clean and minimal
- Easy to navigate
- Form-driven with validation feedback
- Consistent across login, register, and dashboard pages
- Responsive across desktop and mobile screens

---

## 🔑 Change Password Feature

The application includes a secure **Change Password** page that allows authenticated users to update their account password at any time.

### ✅ Functionality

- Accessible only to logged-in users
- Requires current password verification
- New password + confirm password fields
- Password strength validation
- Inline error messages for invalid input
- Show/Hide password toggle
- Secure password hashing before storage
- JWT/session validation before update

### 🔄 Change Password Flow

1. User navigates to **Account Settings → Change Password**
2. User enters:
   - Current password
   - New password
   - Confirm new password
3. System validates:
   - Current password is correct
   - New password meets strength rules
   - New password matches confirmation
4. Password is hashed and updated in the database
5. User receives success confirmation
6. (Optional) User is logged out and required to log in again

---

## 🛡️ Security Rules

- Passwords are never stored in plain text
- Password comparison uses hashing (bcrypt)
- Rate limiting can be applied to prevent brute force attempts
- JWT/session must be valid before password change is allowed

---

## 🧪 Validation Rules (Example)

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

---

## 📌 API Endpoint (Example)


## 🛠️ Tech Stack (Example — adjust to your project)

**Frontend**
- React / Next.js
- Tailwind CSS or CSS Modules
- Axios / Fetch API

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

**Authentication**
- JWT (JSON Web Tokens)
- Password hashing (bcrypt)

---

## ⚙️ Installation

```bash
# clone repository
git clone https://github.com/your-username/task-manager-app.git

# enter project directory
cd task-manager-app

# install dependencies
npm install

# start development server
npm run dev
