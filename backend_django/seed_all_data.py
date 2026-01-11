"""
Comprehensive Data Seeding Script
Seeds all necessary data for the Smart Road System
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_road_system.settings')
django.setup()

from api.models import Admin, Contractor, RoadProject, Complaint, Rating
from django.utils import timezone


def seed_contractors():
    """Seed contractor data"""
    print("\n📋 Seeding Contractors...")
    
    contractors_data = [
        {'contractor_id': 'CON-001', 'name': 'BuildRight Construction', 'email': 'contact@buildright.com'},
        {'contractor_id': 'CON-002', 'name': 'MetroRoads Inc', 'email': 'info@metroroads.com'},
        {'contractor_id': 'CON-003', 'name': 'Highway Masters', 'email': 'support@highwaymasters.com'},
        {'contractor_id': 'CON-004', 'name': 'Urban Infrastructure Co', 'email': 'contact@urbanco.com'},
        {'contractor_id': 'CON-005', 'name': 'Premier Road Solutions', 'email': 'info@premierroads.com'},
    ]
    
    for data in contractors_data:
        contractor, created = Contractor.objects.get_or_create(
            contractor_id=data['contractor_id'],
            defaults={
                'name': data['name'],
                'email': data['email'],
                'password': 'hashed_password',
                'current_rating': 4.0,
                'total_complaints': 0,
                'total_projects': 0
            }
        )
        if created:
            print(f"✓ Created contractor: {contractor.name}")
        else:
            print(f"  Contractor already exists: {contractor.name}")


def seed_roads():
    """Seed road project data"""
    print("\n🛣️ Seeding Road Projects...")
    
    contractors = list(Contractor.objects.all())
    if not contractors:
        print("❌ No contractors found. Please seed contractors first.")
        return
    
    roads_data = [
        {'road_id': 'ROAD-001', 'road_name': 'Main Street Downtown', 'address': '123 Main St, Downtown', 'contractor_idx': 0},
        {'road_id': 'ROAD-002', 'road_name': 'Highway 5 Express', 'address': 'Highway 5, North District', 'contractor_idx': 1},
        {'road_id': 'ROAD-003', 'road_name': 'Park Avenue South', 'address': '456 Park Ave S, Central', 'contractor_idx': 2},
        {'road_id': 'ROAD-004', 'road_name': 'Industrial Road Corridor', 'address': '789 Industrial Rd, East Side', 'contractor_idx': 0},
        {'road_id': 'ROAD-005', 'road_name': 'Residential Colony Road', 'address': '321 Colony Rd, West End', 'contractor_idx': 3},
        {'road_id': 'ROAD-006', 'road_name': 'Coastal Highway', 'address': 'Coastal Hwy, Seaside', 'contractor_idx': 1},
        {'road_id': 'ROAD-007', 'road_name': 'University Boulevard', 'address': 'University Blvd, Campus Area', 'contractor_idx': 4},
        {'road_id': 'ROAD-008', 'road_name': 'Airport Access Road', 'address': 'Airport Rd, Terminal Area', 'contractor_idx': 2},
    ]
    
    for data in roads_data:
        if data['contractor_idx'] < len(contractors):
            contractor = contractors[data['contractor_idx']]
            construction_date = timezone.now() - timedelta(days=365)
            completion_date = timezone.now() - timedelta(days=180)
            warranty_end_date = completion_date + timedelta(days=3650)  # 10 years
            
            road, created = RoadProject.objects.get_or_create(
                road_id=data['road_id'],
                defaults={
                    'road_name': data['road_name'],
                    'contractor': contractor,
                    'contractor_name': contractor.name,
                    'latitude': 40.7128 + (len(data['road_id']) * 0.01),
                    'longitude': -74.0060 + (len(data['road_id']) * 0.01),
                    'address': data['address'],
                    'construction_date': construction_date,
                    'completion_date': completion_date,
                    'warranty_period_years': 10,
                    'warranty_end_date': warranty_end_date,
                    'qr_code_data': f'{{"roadId": "{data["road_id"]}", "roadName": "{data["road_name"]}"}}',
                    'project_cost': 500000 + (len(data['road_id']) * 50000),
                    'road_length': 5.5,
                    'status': 'Active'
                }
            )
            if created:
                print(f"✓ Created road: {road.road_name}")
                contractor.total_projects += 1
                contractor.save()
            else:
                print(f"  Road already exists: {road.road_name}")


def seed_complaints():
    """Seed complaint data"""
    print("\n🚨 Seeding Complaints...")
    
    roads = list(RoadProject.objects.all())
    if not roads:
        print("❌ No roads found. Please seed roads first.")
        return
    
    damage_types = ['Pothole', 'Crack', 'Surface Damage', 'Water Logging', 'Structural Issue']
    severities = ['Low', 'Medium', 'High']
    
    for i, road in enumerate(roads[:5]):  # Add complaints to first 5 roads
        for j in range(2):  # 2 complaints per road
            complaint_id = f"COMPLAINT-{int(timezone.now().timestamp() * 1000) + i * 100 + j}"
            
            complaint, created = Complaint.objects.get_or_create(
                complaint_id=complaint_id,
                defaults={
                    'road': road,
                    'user_id': f'user{i}{j}',
                    'user_email': f'user{i}{j}@example.com',
                    'user_phone': f'+1-555-{1000 + i * 10 + j}',
                    'damage_type': damage_types[i % len(damage_types)],
                    'description': f'Found {damage_types[i % len(damage_types)].lower()} on {road.road_name}. Needs immediate attention.',
                    'photo_url': f'https://example.com/photos/{complaint_id}.jpg',
                    'latitude': 40.7128 + (i * 0.01),
                    'longitude': -74.0060 + (i * 0.01),
                    'severity': severities[j % len(severities)],
                    'status': 'Open'
                }
            )
            if created:
                print(f"✓ Created complaint: {complaint.complaint_id} for {road.road_name}")
                if road.contractor:
                    road.contractor.total_complaints += 1
                    road.contractor.save()
            else:
                print(f"  Complaint already exists: {complaint.complaint_id}")


def seed_ratings():
    """Seed rating data"""
    print("\n⭐ Seeding Ratings...")
    
    contractors = list(Contractor.objects.all())
    roads = list(RoadProject.objects.all())
    
    if not contractors or not roads:
        print("❌ No contractors or roads found. Please seed them first.")
        return
    
    rating_values = [5, 4, 5, 3, 4, 5, 4, 3, 5, 4]
    
    for i, contractor in enumerate(contractors):
        contractor_roads = RoadProject.objects.filter(contractor=contractor)
        
        for j, road in enumerate(contractor_roads[:3]):  # Rate first 3 roads per contractor
            rating_value = rating_values[(i + j) % len(rating_values)]
            
            # Check if rating already exists
            existing_rating = Rating.objects.filter(
                contractor=contractor,
                road=road,
                user_id=f'rater{i}{j}'
            ).first()
            
            if not existing_rating:
                rating = Rating.objects.create(
                    contractor=contractor,
                    road=road,
                    rating_value=rating_value,
                    user_id=f'rater{i}{j}',
                    user_email=f'rater{i}{j}@example.com',
                    comment=f'Good work on {road.road_name}. Quality: {rating_value}/5'
                )
                print(f"✓ Created rating: {rating_value}★ for {contractor.name} on {road.road_name}")
            else:
                print(f"  Rating already exists for {contractor.name} on {road.road_name}")
    
    # Update contractor ratings
    for contractor in contractors:
        ratings = Rating.objects.filter(contractor=contractor)
        if ratings:
            avg_rating = sum(r.rating_value for r in ratings) / len(ratings)
            contractor.current_rating = round(avg_rating, 2)
            contractor.save()
            print(f"✓ Updated {contractor.name} rating to {contractor.current_rating}")


def main():
    """Main seeding function"""
    print("=" * 60)
    print("🌱 SMART ROAD SYSTEM - COMPREHENSIVE DATA SEEDING")
    print("=" * 60)
    
    try:
        seed_contractors()
        seed_roads()
        seed_complaints()
        seed_ratings()
        
        print("\n" + "=" * 60)
        print("✅ DATA SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        # Print summary
        print("\n📊 Database Summary:")
        print(f"   Admins: {Admin.objects.count()}")
        print(f"   Contractors: {Contractor.objects.count()}")
        print(f"   Roads: {RoadProject.objects.count()}")
        print(f"   Complaints: {Complaint.objects.count()}")
        print(f"   Ratings: {Rating.objects.count()}")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
