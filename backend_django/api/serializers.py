from rest_framework import serializers
from .models import Admin, Contractor, RoadProject, Complaint, Rating
from django.contrib.auth.hashers import make_password


class AdminSerializer(serializers.ModelSerializer):
    """Serializer for Admin model"""
    class Meta:
        model = Admin
        fields = ['id', 'username', 'email', 'password', 'full_name', 'role', 'is_active', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class AdminLoginSerializer(serializers.Serializer):
    """Serializer for admin login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class AdminRegisterSerializer(serializers.Serializer):
    """Serializer for admin registration"""
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()


class ContractorSerializer(serializers.ModelSerializer):
    """Serializer for Contractor model"""
    class Meta:
        model = Contractor
        fields = ['id', 'contractor_id', 'name', 'email', 'password', 'current_rating', 
                  'total_complaints', 'total_projects', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class ContractorCreateSerializer(serializers.Serializer):
    """Serializer for creating contractors"""
    contractorId = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()


class RoadProjectSerializer(serializers.ModelSerializer):
    """Serializer for RoadProject model"""
    contractor_details = ContractorSerializer(source='contractor', read_only=True)
    
    class Meta:
        model = RoadProject
        fields = ['id', 'road_id', 'road_name', 'contractor', 'contractor_details', 'contractor_name',
                  'latitude', 'longitude', 'address', 'construction_date', 'completion_date',
                  'warranty_period_years', 'warranty_end_date', 'qr_code_data', 'project_cost',
                  'road_length', 'status', 'created_at', 'updated_at']


class RoadProjectCreateSerializer(serializers.Serializer):
    """Serializer for creating road projects"""
    roadId = serializers.CharField()
    roadName = serializers.CharField()
    contractorId = serializers.IntegerField(required=False, allow_null=True)
    contractorName = serializers.CharField(required=False, allow_null=True)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_null=True)
    constructionDate = serializers.DateTimeField(required=False, allow_null=True)
    completionDate = serializers.DateTimeField(required=False, allow_null=True)
    warrantyPeriodYears = serializers.IntegerField(required=False, default=10)
    projectCost = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)
    roadLength = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for Complaint model"""
    road_details = RoadProjectSerializer(source='road', read_only=True)
    
    class Meta:
        model = Complaint
        fields = ['id', 'complaint_id', 'road', 'road_details', 'user_id', 'user_email', 'user_phone',
                  'damage_type', 'description', 'photo_url', 'latitude', 'longitude', 'status',
                  'severity', 'resolved_date', 'resolution_description', 'created_at', 'updated_at']


class ComplaintCreateSerializer(serializers.Serializer):
    """Serializer for creating complaints"""
    roadId = serializers.CharField()
    userId = serializers.CharField(required=False, allow_null=True)
    userEmail = serializers.EmailField(required=False, allow_null=True)
    userPhone = serializers.CharField(required=False, allow_null=True)
    damageType = serializers.ChoiceField(choices=['Pothole', 'Crack', 'Erosion', 'Flooding', 'Other'])
    description = serializers.CharField()
    photoUrl = serializers.CharField(required=False, allow_null=True)
    location = serializers.DictField(required=False, allow_null=True)
    severity = serializers.ChoiceField(
        choices=['Low', 'Medium', 'High', 'Critical'],
        required=False,
        default='Medium'
    )


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model"""
    class Meta:
        model = Rating
        fields = ['id', 'contractor', 'road', 'user_id', 'user_email', 'rating_value',
                  'comment', 'created_at', 'updated_at']


class RatingCreateSerializer(serializers.Serializer):
    """Serializer for creating ratings"""
    contractorId = serializers.IntegerField()
    roadId = serializers.IntegerField(required=False, allow_null=True)
    ratingValue = serializers.FloatField(min_value=1, max_value=5)
    userEmail = serializers.EmailField(required=False, allow_null=True)
    userId = serializers.CharField(required=False, allow_null=True)
    comment = serializers.CharField(required=False, allow_null=True)
