# Smart Road System - Django Backend

This is the Python Django backend for the Smart Road Construction & Monitoring System, migrated from Node.js/Express.

## Features

- ✅ Django 6.0 + Django REST Framework
- ✅ JWT Authentication
- ✅ SQLite Database (compatible with existing data)
- ✅ CORS enabled for frontend integration
- ✅ All API endpoints from Node.js version
- ✅ Rating calculation algorithm
- ✅ Data migration from Node.js database

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend_django directory:

```env
SECRET_KEY=your-django-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_NAME=smart_road_system.db
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Seed Admin Account (Optional)

```bash
python manage.py seed_admin
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`

### 7. Migrate Data from Node.js Database (Optional)

If you have an existing Node.js database with data:

```bash
python migrate_data.py
```

This will copy all data from `../backend/smart_road_system.db` to the Django database.

### 8. Run Development Server

```bash
python manage.py runserver 5000
```

The server will start at `http://localhost:5000`

## API Endpoints

All endpoints are prefixed with `/api/`

### Health Check
- `GET /api/health` - Server health check

### Admin Endpoints
- `POST /api/admin/register` - Register new admin (super_admin only)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `POST /api/admin/roads` - Add new road
- `GET /api/admin/roads` - Get all roads
- `PUT /api/admin/roads/:id` - Update road
- `DELETE /api/admin/roads/:id` - Delete road
- `POST /api/admin/roads/:id/assign-contractor` - Assign contractor to road
- `GET /api/admin/contractors` - Get all contractors

### Contractor Endpoints
- `POST /api/contractors` - Create contractor
- `GET /api/contractors` - List all contractors
- `POST /api/contractors/rate` - Rate a contractor
- `GET /api/contractors/:id` - Get contractor details
- `GET /api/contractors/:id/projects` - Get contractor projects
- `POST /api/contractors/:id/rate` - Rate contractor for specific road
- `GET /api/contractors/:id/performance` - Get contractor performance
- `GET /api/contractors/performance/dashboard` - Performance dashboard

### Complaint Endpoints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:roadId` - Get complaints for road
- `PUT /api/complaints/:id` - Update complaint status

### Road Endpoints
- `GET /api/roads/:roadId` - Get road details
- `GET /api/roads` - Get all roads

## Project Structure

```
backend_django/
├── api/                          # Main API application
│   ├── management/               # Django management commands
│   │   └── commands/
│   │       └── seed_admin.py     # Seed admin accounts
│   ├── migrations/               # Database migrations
│   ├── models.py                 # Database models
│   ├── serializers.py            # DRF serializers
│   ├── views.py                  # Admin & contractor views
│   ├── views_contractors.py      # Additional contractor views
│   ├── views_complaints_roads.py # Complaint & road views
│   ├── permissions.py            # Custom permissions
│   ├── utils.py                  # Utility functions (rating calc)
│   └── urls.py                   # API URL routing
├── smart_road_system/            # Django project settings
│   ├── settings.py               # Project settings
│   ├── urls.py                   # Main URL configuration
│   └── wsgi.py                   # WSGI configuration
├── manage.py                     # Django management script
├── migrate_data.py               # Data migration script
├── requirements.txt              # Python dependencies
└── .env                          # Environment variables
```

## Key Differences from Node.js Version

### Technology Stack
- **Framework**: Express → Django + Django REST Framework
- **ORM**: Sequelize → Django ORM
- **Authentication**: Custom JWT → djangorestframework-simplejwt
- **Package Manager**: npm → pip

### Code Structure
- Models defined in `models.py` instead of separate files
- Views split across multiple files for organization
- Serializers replace manual JSON serialization
- URL routing in `urls.py` instead of route files

### Database
- Same SQLite database structure
- Compatible table names and column names
- Data can be migrated using `migrate_data.py`

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Django Admin Interface
Access at `http://localhost:5000/admin/`

Create superuser:
```bash
python manage.py createsuperuser
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Generate a strong `SECRET_KEY`
3. Update `ALLOWED_HOSTS` with your domain
4. Use a production database (PostgreSQL/MySQL)
5. Collect static files: `python manage.py collectstatic`
6. Use a production server (Gunicorn, uWSGI)

## Troubleshooting

### Port Already in Use
```bash
# Change port in command
python manage.py runserver 8000
```

### Database Locked
- Close any connections to the database
- Restart the server

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## Support

For issues or questions, refer to the main project documentation in the `SmartRoadSystem` directory.
