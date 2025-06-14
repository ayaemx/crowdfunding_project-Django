# CrowdFunding Web App - الخير فينا (GOODNESS)

A modern full-stack web platform for starting, managing, and supporting fundraising campaigns in Egypt.

---

## 🚀 Features

- **User Authentication**
  - Registration with first name, last name, email, password, Egyptian mobile validation, and profile picture
  - Activation email after registration (link expires in 24 hours)
  - Login with email and password (after activation)
  - Password reset via email
  - Profile view and edit (all fields except email)
  - Optional info: birthdate, Facebook profile, country
  - Account deletion with password confirmation

- **Projects**
  - Create fundraising campaigns with title, details, category, target, tags, and multiple images
  - Set campaign start and end dates
  - View, donate, and comment on projects
  - Rate, report, and search projects by title or tags
  - Project page shows average rating, image slider, similar projects, and more
  - Project creator can cancel project if donations are less than 25% of target

- **Comments**
  - Users can add comments and replies on projects
  - Users can report inappropriate projects and comments
  - Reported comments are hidden from regular users and marked for moderation

- **Homepage**
  - Slider for top-rated projects
  - Latest and featured projects with pagination and distinct layouts
  - Category browsing and project search

- **Admin Features**
  - Manage categories, featured projects, and user reports
  - Moderate reported comments and projects

---

## 📦 Technology Stack

- **Backend:** Django 5, Django REST Framework
- **Frontend:** React.js, Material-UI (MUI)
- **Database:** SQLite (development), easily switchable to PostgreSQL
- **Authentication:** Token-based authentication
- **Other:** Image handling with Pillow, Email activation, Responsive design

---

## 🛠 Setup Instructions

1. Clone the repository
2. Create and activate a virtual environment
3. Install dependencies from requirements.txt
4. Configure environment variables for email
5. Apply migrations
6. Create a superuser
7. Run the development server

---

## 📄 Project Structure

- `users/` - User management (models, views, serializers, forms)
- `projects/` - Project management and APIs
- `comments/` - Commenting system with reporting
- `frontend/` - React frontend with components and pages

---

## 🙏 Acknowledgements

Inspired by GoFundMe, Kickstarter, and other leading crowdfunding platforms.

---

*Ready to change the world, one project at a time!*
