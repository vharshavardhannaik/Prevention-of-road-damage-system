import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_road_system.settings')
django.setup()

from api.models import Contractor, RoadProject, Complaint, Admin

try:
    # Check if data exists
    contractor_count = Contractor.objects.count()
    admin_count = Admin.objects.count()
    road_count = RoadProject.objects.count()
    complaint_count = Complaint.objects.count()
    
    print(f"Current data:")
    print(f"  Contractors: {contractor_count}")
    print(f"  Admins: {admin_count}")
    print(f"  Roads: {road_count}")
    print(f"  Complaints: {complaint_count}")
    
    # Seed admin if none exists
    if admin_count == 0:
        print("\nCreating default admin...")
        admin = Admin.objects.create(
            username='admin',
            email='admin@smartroad.com',
            full_name='System Administrator',
            is_superuser=True
        )
        admin.set_password('admin123')
        admin.save()
        print("Admin created successfully!")
    
    # Seed contractors if none exist
    if contractor_count == 0:
        print("\nCreating sample contractors...")
        contractors_data = [
            {'contractor_id': 'CONT-001', 'name': 'ABC Construction', 'email': 'abc@construction.com'},
            {'contractor_id': 'CONT-002', 'name': 'XYZ Builders', 'email': 'xyz@builders.com'},
            {'contractor_id': 'CONT-003', 'name': 'Quality Roads Ltd', 'email': 'quality@roads.com'},
        ]
        for data in contractors_data:
            Contractor.objects.create(**data)
        print(f"Created {len(contractors_data)} contractors!")
    
    # Seed roads if none exist
    if road_count == 0:
        print("\nCreating sample roads...")
        roads_data = [
            {
                'road_id': 'ROAD-001',
                'road_name': 'Main Street',
                'address': '123 Main St, City Center',
                'contractor_id': 'CONT-001',
                'start_date': '2025-01-01',
                'end_date': '2025-06-30',
                'status': 'In Progress'
            },
            {
                'road_id': 'ROAD-002',
                'road_name': 'Highway 101',
                'address': 'Highway 101, North District',
                'contractor_id': 'CONT-002',
                'start_date': '2024-12-01',
                'end_date': '2025-08-31',
                'status': 'In Progress'
            }
        ]
        for data in roads_data:
            contractor = Contractor.objects.get(contractor_id=data.pop('contractor_id'))
            RoadProject.objects.create(contractor=contractor, **data)
        print(f"Created {len(roads_data)} roads!")
    
    print("\n✓ Database check and seed completed successfully!")
    sys.exit(0)
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
