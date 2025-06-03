# CrowdFunding Web App

A modern web platform for starting, managing, and supporting fundraising projects in Egypt.

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

- **Homepage**
  - Slider for top-rated projects
  - Latest and featured projects
  - Category browsing and project search

- **Admin Features**
  - Add/manage categories and featured projects
  - Moderate reports and comments

---

## 📦 Getting Started

### Prerequisites

- Python 3.10+
- pip
- Git

### Installation

1. **Clone the repository:**
    ```
    git clone https://github.com/yourusername/crowdfunding_project-Django.git
    cd crowdfunding_project-Django
    ```

2. **Create and activate a virtual environment:**
    ```
    python -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies:**
    ```
    pip install -r requirements.txt
    ```

4. **Set up environment variables for email (create a `.env` file):**
    ```
    EMAIL_HOST_USER=your_gmail@gmail.com
    EMAIL_HOST_PASSWORD=your_gmail_app_password
    ```

5. **Apply migrations:**
    ```
    python manage.py migrate
    ```

6. **Create a superuser:**
    ```
    python manage.py createsuperuser
    ```

7. **Run the development server:**
    ```
    python manage.py runserver
    ```

8. **Open the app:**
    - Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser.

---

## ✨ Why This Project Is Amazing

- Real-world authentication: registration, activation, password reset, and secure login.
- Rich user experience: project creation, rating, donation, and reporting.
- Admin power: manage categories, featured projects, and user reports.
- Modern, maintainable code following Django best practices.
- Ready for deployment: just add your production database and email credentials.

---

## 📝 Project Structure

crowdfunding_project-Django/
├── users/
│ ├── models.py
│ ├── views.py
│ ├── urls.py
│ ├── templates/users/
│ └── ...
├── projects/
├── categories/
├── templates/
├── static/
├── manage.py
└── requirements.txt


---

## 🧑‍💻 Contributing

- Fork the repo
- Create your feature branch (`git checkout -b feature/AmazingFeature`)
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request

---

## 📄 License

MIT License

---

## 📸 Screenshots

*To be added soon!*

---

## 🙏 Acknowledgements

- Inspired by [GoFundMe](https://www.gofundme.com), [Kickstarter](https://www.kickstarter.com), and [crowdfunding.com](https://www.crowdfunding.com)
- Project brief: [Django-Project-OS39-2.pdf][1]

---

## 📅 Last Updated

May 30, 2025

---

*Ready to change the world, one project at a time!*

[1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/70586898/530663dd-27e2-4d47-8f8b-badd431ba286/Django-Project-OS39-2.pdf
