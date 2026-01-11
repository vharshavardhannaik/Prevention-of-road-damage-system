from django.core.management.base import BaseCommand
from api.models import Admin


class Command(BaseCommand):
    help = 'Seeds default admin accounts'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding admin accounts...')
        
        # Create super admin if not exists
        if not Admin.objects.filter(username='admin').exists():
            admin = Admin.objects.create(
                username='admin',
                email='admin@smartroad.com',
                password='Admin@456',  # Password that matches frontend expectations
                full_name='System Administrator',
                role='super_admin',
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created super admin: {admin.username}'))
        else:
            # Update existing admin password
            admin = Admin.objects.get(username='admin')
            admin.password = 'Admin@456'
            admin.save()
            self.stdout.write(self.style.SUCCESS('✓ Updated admin password'))
        
        self.stdout.write(self.style.SUCCESS('Admin seeding complete!'))
