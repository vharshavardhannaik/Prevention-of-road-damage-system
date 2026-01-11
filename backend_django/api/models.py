from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import MinValueValidator, MaxValueValidator


class Admin(models.Model):
    """Admin user model with authentication"""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin'),
    ]
    
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, db_column='fullName')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    is_active = models.BooleanField(default=True, db_column='isActive')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')
    
    class Meta:
        db_table = 'Admins'
    
    def save(self, *args, **kwargs):
        # Hash password before saving if it's not already hashed
        # Django hashed passwords start with algorithm identifier like 'pbkdf2_sha256$'
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def validate_password(self, raw_password):
        """Verify password"""
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return self.username


class Contractor(models.Model):
    """Contractor model"""
    contractor_id = models.CharField(max_length=255, unique=True, db_column='contractorId')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    current_rating = models.FloatField(
        default=5.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        db_column='currentRating'
    )
    total_complaints = models.IntegerField(default=0, db_column='totalComplaints')
    total_projects = models.IntegerField(default=0, db_column='totalProjects')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')
    
    class Meta:
        db_table = 'contractors'
    
    def __str__(self):
        return self.name


class RoadProject(models.Model):
    """Road project model"""
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Under Maintenance', 'Under Maintenance'),
    ]
    
    road_id = models.CharField(max_length=255, unique=True, db_column='roadId')
    road_name = models.CharField(max_length=255, db_column='roadName')
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects',
        db_column='contractorId'
    )
    contractor_name = models.CharField(max_length=255, null=True, blank=True, db_column='contractorName')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    construction_date = models.DateTimeField(db_column='constructionDate')
    completion_date = models.DateTimeField(db_column='completionDate')
    warranty_period_years = models.IntegerField(default=10, db_column='warrantyPeriodYears')
    warranty_end_date = models.DateTimeField(null=True, blank=True, db_column='warrantyEndDate')
    qr_code_data = models.TextField(null=True, blank=True, db_column='qrCodeData')
    project_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        db_column='projectCost'
    )
    road_length = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        db_column='roadLength'
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')
    
    class Meta:
        db_table = 'road_projects'
    
    def __str__(self):
        return self.road_name


class Complaint(models.Model):
    """Complaint model"""
    DAMAGE_TYPE_CHOICES = [
        ('Pothole', 'Pothole'),
        ('Crack', 'Crack'),
        ('Erosion', 'Erosion'),
        ('Flooding', 'Flooding'),
        ('Other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Under Review', 'Under Review'),
        ('Resolved', 'Resolved'),
        ('Rejected', 'Rejected'),
    ]
    
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    complaint_id = models.CharField(max_length=255, unique=True, db_column='complaintId')
    road = models.ForeignKey(
        RoadProject,
        on_delete=models.CASCADE,
        related_name='complaints',
        db_column='roadId'
    )
    user_id = models.CharField(max_length=255, default='anonymous', db_column='userId')
    user_email = models.EmailField(null=True, blank=True, db_column='userEmail')
    user_phone = models.CharField(max_length=20, null=True, blank=True, db_column='userPhone')
    damage_type = models.CharField(max_length=50, choices=DAMAGE_TYPE_CHOICES, db_column='damageType')
    description = models.TextField()
    photo_url = models.TextField(null=True, blank=True, db_column='photoUrl')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Medium')
    resolved_date = models.DateTimeField(null=True, blank=True, db_column='resolvedDate')
    resolution_description = models.TextField(null=True, blank=True, db_column='resolutionDescription')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')
    
    class Meta:
        db_table = 'complaints'
    
    def __str__(self):
        return f"{self.complaint_id} - {self.damage_type}"


class Rating(models.Model):
    """Rating model for contractor reviews"""
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name='ratings',
        db_column='contractorId'
    )
    road = models.ForeignKey(
        RoadProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='road_ratings',
        db_column='roadId'
    )
    user_id = models.CharField(max_length=255, default='anonymous', db_column='userId')
    user_email = models.EmailField(null=True, blank=True, db_column='userEmail')
    rating_value = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        db_column='ratingValue'
    )
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')
    
    class Meta:
        db_table = 'ratings'
    
    def __str__(self):
        return f"Rating {self.rating_value} for {self.contractor.name}"
