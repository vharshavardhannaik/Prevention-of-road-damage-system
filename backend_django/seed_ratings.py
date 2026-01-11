import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_road_system.settings')
django.setup()

from api.models import Contractor, RoadProject, Rating
from datetime import datetime

# Get all contractors
contractors = Contractor.objects.all()

print(f"Found {contractors.count()} contractors")

# Add some ratings for each contractor
for contractor in contractors:
    # Get projects for this contractor
    projects = RoadProject.objects.filter(contractor=contractor)
    
    if projects.count() > 0:
        # Add 3-5 ratings for each contractor
        for i in range(3):
            project = projects.first()
            rating = Rating.objects.create(
                contractor=contractor,
                road=project,
                user_id=f"user-{i}",
                user_email=f"user{i}@example.com",
                rating_value=4.0 + (i * 0.2),  # Ratings between 4.0 and 4.4
                comment=f"Good work on project {project.road_name}"
            )
            print(f"Created rating {rating.id} for {contractor.name}: {rating.rating_value}")
        
        # Calculate average rating
        ratings = Rating.objects.filter(contractor=contractor)
        if ratings.count() > 0:
            avg_rating = sum(r.rating_value for r in ratings) / ratings.count()
            contractor.current_rating = round(avg_rating, 2)
            contractor.save()
            print(f"Updated {contractor.name} average rating to {contractor.current_rating}")

print("\nRatings seeded successfully!")
print(f"Total ratings created: {Rating.objects.count()}")
