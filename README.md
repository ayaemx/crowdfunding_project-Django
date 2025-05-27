# Crowdfunding Django Project

## Setup Instructions

1. Clone the repository:
git clone https://github.com/ayaemx/crowdfunding_project-Django.git
>cd crowdfunding_projectt

2. Create and activate a virtual environment:
>python3 -m venv venv
>>source venv/bin/activate


3. Install requirements:
>pip install -r requirements.txt


4. Run migrations:
>python manage.py makemigrations
>>python manage.py migrate


5. Create a superuser:
>python manage.py createsuperuser


6. Run the development server:
>python manage.py runserver


7. Access the site at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## Branching Workflow

- Work on the `develop` branch.
- Create a feature branch for your work:  
`git checkout -b feature/your-feature-name`
- Commit and push your changes.
- Open a Pull Request to merge into `develop`.
- Do **not** commit `/media/`, `/staticfiles/`, or `.env`.

## Shared Resources

- All uploads go to `/media/`
- All global static files go to `/static/`
- All global templates go to `/templates/` (use `base.html` as a parent)
