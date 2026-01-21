# Multi-Tenant-Blog-System
This is a multi-tenant blog system with role-based access control. The system should support multiple tenants (organizations/groups) with proper user and content isolation.


# Multi-Tenant Blog System (MERN Stack)

A full-stack MERN application implementing a **multi-tenant blog platform** with **role-based access control (RBAC)**.  
Each tenant represents a separate organization, ensuring complete user and content isolation.

This project focuses on **scalability, security, and real-world architecture practices**.

---

## 🚀 Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure password hashing using bcrypt
- Role-based access control (Admin / Regular User)
- Authorization enforced at both frontend and backend

---

### 🏢 Multi-Tenant Architecture
- Each tenant acts as an independent organization
- Users and posts are strictly scoped to their tenant
- No cross-tenant data access
- All database queries enforce tenant-level restrictions

---

### 👥 User Roles

#### Admin
- Manage all tenants
- View users tenant-wise
- View and manage posts across all tenants
- Filter posts by tenant and status
- View post analytics (views count)

#### Regular User
- Create, edit, and delete own posts only
- Cannot access posts from other users or tenants
- Can view post view count on their own posts

---

## ✨ Additional Features

### 🔎 Advanced Admin Filters
- Admin can filter **users by tenant**
- Admin can filter **posts by tenant**
- Admin can further filter posts by status:
  - **Published**
  - **Draft**
  - **Archived**

---

### 👀 Post View Tracking
- Each post tracks the number of views
- View count increases automatically when a post is opened
- Both **Admin and Regular Users** can see view counts

---

## 🎨 UI / UX Enhancements

- Subtle hover effects added across the application to improve interactivity
- All clickable elements include a **hover scale effect**, creating a smooth zoom-like illusion
- Clean transitions are used to keep the UI professional and responsive
- Implemented **Dark Mode and Light Mode**
- Users can switch themes based on preference for better readability and comfort

---

## 🗂️ Database Design (MongoDB)

### Tenant
- name
- createdAt

### User
- name
- email
- password
- role (admin / user)
- tenantId

### Post
- title
- content
- status (published / draft / archived)
- views
- userId
- tenantId
- createdAt
- updatedAt

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Context API
- React Hot Toast
- CSS (Transitions & Hover Effects)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv

---

## 📁 Project Structure

backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── config/
├── server.js
├── createAdmin.js
└── testLogin.js

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── context/
│ └── services/
└── public/

---

## ⚙️ Project Setup & Run Instructions

Follow the steps below to run the project locally for the first time.

### 1️⃣ Install Dependencies

Install dependencies for both frontend and backend.

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install


Before starting the application, create an initial admin user:
cd backend
node createAdmin.js

To verify admin login functionality:
node testLogin.js


Start Frontend Application
Open a new terminal window:
cd frontend
npm start

Start Backend Application
Open a new terminal window:
cd backend
npm run dev
