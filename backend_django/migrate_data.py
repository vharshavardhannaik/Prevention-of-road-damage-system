"""
Data Migration Script
Migrates data from Node.js/Sequelize SQLite database to Django database
"""

import os
import sys
import sqlite3
import django
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_road_system.settings')
django.setup()

from api.models import Admin, Contractor, RoadProject, Complaint, Rating
from django.utils import timezone


def connect_old_db():
    """Connect to the old Node.js database"""
    old_db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'smart_road_system.db')
    if not os.path.exists(old_db_path):
        print(f"❌ Old database not found at: {old_db_path}")
        return None
    return sqlite3.connect(old_db_path)


def migrate_admins(conn):
    """Migrate Admin data"""
    print("\n📋 Migrating Admins...")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Admins")
    rows = cursor.fetchall()
    
    migrated = 0
    for row in rows:
        try:
            Admin.objects.create(
                id=row[0],
                username=row[1],
                email=row[2],
                password=row[3],  # Already hashed
                full_name=row[4],
                role=row[5],
                is_active=bool(row[6]),
                created_at=row[7],
                updated_at=row[8]
            )
            migrated += 1
        except Exception as e:
            print(f"  ⚠️  Error migrating admin {row[1]}: {e}")
    
    print(f"✓ Migrated {migrated}/{len(rows)} admins")
    return migrated


def migrate_contractors(conn):
    """Migrate Contractor data"""
    print("\n📋 Migrating Contractors...")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contractors")
    rows = cursor.fetchall()
    
    migrated = 0
    for row in rows:
        try:
            Contractor.objects.create(
                id=row[0],
                contractor_id=row[1],
                name=row[2],
                email=row[3],
                password=row[4],
                current_rating=row[5] or 5.0,
                total_complaints=row[6] or 0,
                total_projects=row[7] or 0,
                created_at=row[8],
                updated_at=row[9]
            )
            migrated += 1
        except Exception as e:
            print(f"  ⚠️  Error migrating contractor {row[2]}: {e}")
    
    print(f"✓ Migrated {migrated}/{len(rows)} contractors")
    return migrated


def migrate_road_projects(conn):
    """Migrate RoadProject data"""
    print("\n📋 Migrating Road Projects...")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM road_projects")
    rows = cursor.fetchall()
    
    migrated = 0
    for row in rows:
        try:
            contractor = None
            if row[3]:  # contractorId
                try:
                    contractor = Contractor.objects.get(id=row[3])
                except Contractor.DoesNotExist:
                    pass
            
            RoadProject.objects.create(
                id=row[0],
                road_id=row[1],
                road_name=row[2],
                contractor=contractor,
                contractor_name=row[4],
                latitude=row[5],
                longitude=row[6],
                address=row[7],
                construction_date=row[8],
                completion_date=row[9],
                warranty_period_years=row[10] or 10,
                warranty_end_date=row[11],
                qr_code_data=row[12],
                project_cost=row[13],
                road_length=row[14],
                status=row[15] or 'Active',
                created_at=row[16],
                updated_at=row[17]
            )
            migrated += 1
        except Exception as e:
            print(f"  ⚠️  Error migrating road project {row[2]}: {e}")
    
    print(f"✓ Migrated {migrated}/{len(rows)} road projects")
    return migrated


def migrate_complaints(conn):
    """Migrate Complaint data"""
    print("\n📋 Migrating Complaints...")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints")
    rows = cursor.fetchall()
    
    migrated = 0
    for row in rows:
        try:
            road = RoadProject.objects.get(id=row[2])
            
            Complaint.objects.create(
                id=row[0],
                complaint_id=row[1],
                road=road,
                user_id=row[3] or 'anonymous',
                user_email=row[4],
                user_phone=row[5],
                damage_type=row[6],
                description=row[7],
                photo_url=row[8],
                latitude=row[9],
                longitude=row[10],
                status=row[11] or 'Open',
                severity=row[12] or 'Medium',
                resolved_date=row[13],
                resolution_description=row[14],
                created_at=row[15],
                updated_at=row[16]
            )
            migrated += 1
        except Exception as e:
            print(f"  ⚠️  Error migrating complaint {row[1]}: {e}")
    
    print(f"✓ Migrated {migrated}/{len(rows)} complaints")
    return migrated


def migrate_ratings(conn):
    """Migrate Rating data"""
    print("\n📋 Migrating Ratings...")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ratings")
    rows = cursor.fetchall()
    
    migrated = 0
    for row in rows:
        try:
            contractor = Contractor.objects.get(id=row[1])
            road = None
            if row[2]:
                try:
                    road = RoadProject.objects.get(id=row[2])
                except RoadProject.DoesNotExist:
                    pass
            
            Rating.objects.create(
                id=row[0],
                contractor=contractor,
                road=road,
                user_id=row[3] or 'anonymous',
                user_email=row[4],
                rating_value=row[5],
                comment=row[6],
                created_at=row[7],
                updated_at=row[8]
            )
            migrated += 1
        except Exception as e:
            print(f"  ⚠️  Error migrating rating: {e}")
    
    print(f"✓ Migrated {migrated}/{len(rows)} ratings")
    return migrated


def verify_migration():
    """Verify the migration was successful"""
    print("\n🔍 Verifying Migration...")
    
    stats = {
        'Admins': Admin.objects.count(),
        'Contractors': Contractor.objects.count(),
        'Road Projects': RoadProject.objects.count(),
        'Complaints': Complaint.objects.count(),
        'Ratings': Rating.objects.count()
    }
    
    print("\n📊 Migration Summary:")
    for model, count in stats.items():
        print(f"  {model}: {count} records")
    
    return stats


def main():
    """Main migration function"""
    print("=" * 60)
    print("🚀 Starting Data Migration from Node.js to Django")
    print("=" * 60)
    
    # Connect to old database
    conn = connect_old_db()
    if not conn:
        print("\n❌ Migration failed: Could not connect to old database")
        return
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("\n🗑️  Clearing existing Django database...")
        Rating.objects.all().delete()
        Complaint.objects.all().delete()
        RoadProject.objects.all().delete()
        Contractor.objects.all().delete()
        Admin.objects.all().delete()
        print("✓ Database cleared")
        
        # Migrate data
        total_migrated = 0
        total_migrated += migrate_admins(conn)
        total_migrated += migrate_contractors(conn)
        total_migrated += migrate_road_projects(conn)
        total_migrated += migrate_complaints(conn)
        total_migrated += migrate_ratings(conn)
        
        # Verify migration
        stats = verify_migration()
        
        print("\n" + "=" * 60)
        print(f"✅ Migration Complete! Total records migrated: {total_migrated}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()


if __name__ == '__main__':
    main()
