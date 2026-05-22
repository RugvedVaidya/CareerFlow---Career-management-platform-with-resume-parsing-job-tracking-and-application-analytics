# CareerFlow

CareerFlow is a full-stack career management platform that helps users organize their job search, track applications, manage resumes, and improve interview preparation in one place.

The goal of CareerFlow is to simplify the placement and job-hunting process by giving users a structured dashboard where they can monitor their progress, store important career-related data, and stay consistent throughout their preparation journey.

---

##  Features

### User Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes for authenticated users
- Password hashing for secure credential storage

### Career Dashboard
- Personalized dashboard for each user
- Track overall career preparation progress
- View job applications, resume details, and preparation status

### Job Application Tracking
- Add and manage job applications
- Track company name, role, status, and important dates
- Update application progress such as:
  - Applied
  - Shortlisted
  - Interview Scheduled
  - Rejected
  - Selected

### Resume Management
- Upload and manage resumes
- Store resume-related details
- Keep track of resume versions for different roles

### Interview Preparation
- Maintain preparation topics
- Track completed and pending topics
- Organize technical and HR interview preparation

### Backend API
- RESTful API architecture
- Modular route structure
- Proper error handling
- Middleware-based authentication
- MongoDB database integration

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js
- Multer

### Tools
- Git
- GitHub
- Postman
- VS Code

---

## 📁 Project Structure

```bash
CareerFlow/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md