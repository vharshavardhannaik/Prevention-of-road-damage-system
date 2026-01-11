import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_road_system.settings')
django.setup()

from api.models import Admin

# Delete all existing admins
deleted_count = Admin.objects.all().delete()[0]
print(f"Deleted {deleted_count} existing admin(s)")

# Create new admin
admin = Admin.objects.create(
    username='admin',
    email='admin@smartroad.com',
    password='Admin@456',
    full_name='System Administrator',
    role='super_admin',
    is_active=True
)

print(f"\n✓ Admin created successfully!")
print(f"  Username: {admin.username}")
print(f"  Email: {admin.email}")
print(f"  Role: {admin.role}")
print(f"  Password hash: {admin.password[:40]}...")
print(f"\n✓ You can now login with:")
print(f"  Username: admin")
print(f"  Password: Admin@456")
