import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_road_system.settings')
django.setup()

from api.models import Rating, Contractor

ratings = Rating.objects.all()
print(f'Total ratings: {ratings.count()}')

print("\nAll ratings:")
for r in ratings:
    print(f'  Contractor: {r.contractor.name if r.contractor else "None"}, Value: {r.rating_value}')

print("\nContractors with their stored ratings:")
contractors = Contractor.objects.all()
for c in contractors:
    actual_ratings = Rating.objects.filter(contractor=c)
    actual_avg = sum(r.rating_value for r in actual_ratings) / actual_ratings.count() if actual_ratings.count() > 0 else 0
    print(f'  {c.name}: stored={c.current_rating}, actual_avg={actual_avg:.2f}, count={actual_ratings.count()}')

total_rating = sum(c.current_rating for c in contractors if c.current_rating)
avg = total_rating / contractors.count() if contractors.count() > 0 else 0
print(f'\nAverage rating across all contractors: {avg:.2f}')
