from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import datetime
import jwt
from django.conf import settings

from .models import Admin, Contractor, RoadProject, Complaint, Rating
from .serializers import (
    AdminSerializer, AdminLoginSerializer, AdminRegisterSerializer,
    ContractorSerializer, ContractorCreateSerializer,
    RoadProjectSerializer, RoadProjectCreateSerializer,
    ComplaintSerializer, ComplaintCreateSerializer,
    RatingSerializer, RatingCreateSerializer
)
from .permissions import IsAdminUser, IsSuperAdmin
from .utils import (
    calculate_contractor_rating, get_risk_level,
    calculate_performance_score, get_performance_rank, get_rating_distribution
)


# ==================== ADMIN ENDPOINTS ====================

@api_view(['POST'])
@permission_classes([IsAdminUser, IsSuperAdmin])
def admin_register(request):
    """Register a new admin (super_admin only)"""
    try:
        serializer = AdminRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Check if admin already exists
        if Admin.objects.filter(username=data['username']).exists() or \
           Admin.objects.filter(email=data['email']).exists():
            return Response({'error': 'Username or email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new admin
        admin = Admin.objects.create(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            full_name=data['full_name'],
            role='admin'
        )
        
        return Response({
            'message': 'Admin registered successfully',
            'admin': {
                'id': admin.id,
                'username': admin.username,
                'email': admin.email,
                'fullName': admin.full_name,
                'role': admin.role
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin login endpoint"""
    try:
        serializer = AdminLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Find admin by username
        try:
            admin = Admin.objects.get(username=username)
        except Admin.DoesNotExist:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if admin is active
        if not admin.is_active:
            return Response({'error': 'Admin account is inactive'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verify password
        if not admin.validate_password(password):
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT token
        import time
        token_payload = {
            'id': admin.id,
            'username': admin.username,
            'email': admin.email,
            'role': admin.role,
            'exp': int(time.time()) + (24 * 60 * 60)  # 24 hours from now as Unix timestamp
        }
        
        token = jwt.encode(
            token_payload,
            settings.SIMPLE_JWT['SIGNING_KEY'],
            algorithm=settings.SIMPLE_JWT['ALGORITHM']
        )
        
        # Ensure token is a string (PyJWT 2.0+ returns string, older versions return bytes)
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        return Response({
            'message': 'Login successful',
            'token': token,
            'admin': {
                'id': admin.id,
                'username': admin.username,
                'email': admin.email,
                'fullName': admin.full_name,
                'role': admin.role
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Login error: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_profile(request):
    """Get logged-in admin profile"""
    try:
        admin = Admin.objects.get(id=request.admin['id'])
        serializer = AdminSerializer(admin)
        data = serializer.data
        data.pop('password', None)
        return Response({'admin': data}, status=status.HTTP_200_OK)
    except Admin.DoesNotExist:
        return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_add_road(request):
    """Add a new road (admin only)"""
    try:
        data = request.data
        
        # Validation
        if not data.get('roadId') or not data.get('roadName'):
            return Response({'error': 'Road ID and Road Name are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if road already exists
        if RoadProject.objects.filter(road_id=data['roadId']).exists():
            return Response({'error': 'Road with this ID already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify contractor if provided
        contractor = None
        if data.get('contractorId'):
            try:
                contractor = Contractor.objects.get(id=data['contractorId'])
            except Contractor.DoesNotExist:
                return Response({'error': 'Contractor not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate and convert latitude/longitude
        latitude = None
        longitude = None
        if data.get('latitude'):
            try:
                latitude = float(data['latitude'])
                if latitude < -90 or latitude > 90:
                    latitude = None  # Invalid latitude, set to None
            except (ValueError, TypeError):
                latitude = None
        
        if data.get('longitude'):
            try:
                longitude = float(data['longitude'])
                if longitude < -180 or longitude > 180:
                    longitude = None  # Invalid longitude, set to None
            except (ValueError, TypeError):
                longitude = None
        
        # Generate QR Code data
        import json
        qr_code_data = json.dumps({
            'roadId': data['roadId'],
            'roadName': data['roadName'],
            'timestamp': timezone.now().isoformat()
        })
        
        # Calculate warranty end date
        warranty_years = data.get('warrantyPeriodYears', 10)
        warranty_end_date = timezone.now() + timezone.timedelta(days=warranty_years * 365)
        
        # Create new road
        road = RoadProject.objects.create(
            road_id=data['roadId'],
            road_name=data['roadName'],
            contractor=contractor,
            contractor_name=data.get('contractorName'),
            latitude=latitude,
            longitude=longitude,
            address=data.get('address'),
            construction_date=data.get('constructionDate', timezone.now()),
            completion_date=data.get('completionDate', timezone.now()),
            warranty_period_years=warranty_years,
            warranty_end_date=warranty_end_date,
            qr_code_data=qr_code_data,
            project_cost=data.get('projectCost'),
            road_length=data.get('roadLength'),
            status='Active'
        )
        
        serializer = RoadProjectSerializer(road)
        return Response({
            'message': 'Road added successfully',
            'road': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error adding road: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_get_roads(request):
    """Get all roads (admin only)"""
    try:
        roads = RoadProject.objects.all().order_by('-created_at')
        serializer = RoadProjectSerializer(roads, many=True)
        return Response({
            'count': len(serializer.data),
            'roads': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_road(request, road_id):
    """Update road details (admin only)"""
    try:
        road = RoadProject.objects.get(id=road_id)
        data = request.data
        
        # Check if new roadId is already taken
        if data.get('roadId') and data['roadId'] != road.road_id:
            if RoadProject.objects.filter(road_id=data['roadId']).exists():
                return Response({'error': 'Road with this ID already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update fields
        if data.get('roadId'):
            road.road_id = data['roadId']
        if data.get('roadName'):
            road.road_name = data['roadName']
        if 'contractorId' in data:
            if data['contractorId']:
                road.contractor_id = data['contractorId']
            else:
                road.contractor = None
        if 'contractorName' in data:
            road.contractor_name = data['contractorName']
        if data.get('latitude'):
            road.latitude = data['latitude']
        if data.get('longitude'):
            road.longitude = data['longitude']
        if data.get('address'):
            road.address = data['address']
        if data.get('status'):
            road.status = data['status']
        
        road.save()
        
        serializer = RoadProjectSerializer(road)
        return Response({
            'message': 'Road updated successfully',
            'road': serializer.data
        }, status=status.HTTP_200_OK)
        
    except RoadProject.DoesNotExist:
        return Response({'error': 'Road not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_road(request, road_id):
    """Delete a road (admin only)"""
    try:
        road = RoadProject.objects.get(id=road_id)
        road.delete()
        return Response({'message': 'Road deleted successfully'}, status=status.HTTP_200_OK)
    except RoadProject.DoesNotExist:
        return Response({'error': 'Road not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_assign_contractor(request, road_id):
    """Assign a contractor to a road (admin only)"""
    try:
        contractor_id = request.data.get('contractorId')
        if not contractor_id:
            return Response({'error': 'Contractor ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        road = RoadProject.objects.get(id=road_id)
        contractor = Contractor.objects.get(id=contractor_id)
        
        road.contractor = contractor
        road.save()
        
        serializer = RoadProjectSerializer(road)
        return Response({
            'message': 'Contractor assigned successfully',
            'road': serializer.data
        }, status=status.HTTP_200_OK)
        
    except RoadProject.DoesNotExist:
        return Response({'error': 'Road not found'}, status=status.HTTP_404_NOT_FOUND)
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_get_contractors(request):
    """Get all contractors (admin only)"""
    try:
        contractors = Contractor.objects.all()
        serializer = ContractorSerializer(contractors, many=True)
        data = serializer.data
        for item in data:
            item.pop('password', None)
        return Response({
            'count': len(data),
            'contractors': data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== CONTRACTOR ENDPOINTS ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def contractor_create(request):
    """Create a new contractor"""
    try:
        data = request.data
        
        if not data.get('contractorId') or not data.get('name') or not data.get('email'):
            return Response({'error': 'contractorId, name, and email are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if contractor already exists
        if Contractor.objects.filter(contractor_id=data['contractorId']).exists():
            return Response({'error': 'Contractor with this ID already exists'}, status=status.HTTP_409_CONFLICT)
        
        # Create contractor
        contractor = Contractor.objects.create(
            contractor_id=data['contractorId'],
            name=data['name'],
            email=data['email'],
            password='DefaultPassword@123',
            current_rating=0,
            total_complaints=0,
            total_projects=0
        )
        
        return Response({
            'message': 'Contractor created successfully',
            'contractor': {
                'id': contractor.id,
                'contractorId': contractor.contractor_id,
                'name': contractor.name,
                'email': contractor.email,
                'currentRating': 0,
                'totalComplaints': 0,
                'totalProjects': 0
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_list(request):
    """Fetch all contractors sorted by rating"""
    try:
        sort_by = request.GET.get('sortBy', 'rating')
        order = request.GET.get('order', 'desc')
        
        contractors = Contractor.objects.all()
        enriched_contractors = []
        
        for contractor in contractors:
            ratings = Rating.objects.filter(contractor=contractor)
            avg_rating = sum(r.rating_value for r in ratings) / len(ratings) if ratings else 0
            
            projects = RoadProject.objects.filter(contractor=contractor)
            project_ids = [p.id for p in projects]
            complaints = Complaint.objects.filter(road_id__in=project_ids)
            
            enriched_contractors.append({
                'id': contractor.id,
                'contractorId': contractor.contractor_id,
                'name': contractor.name,
                'email': contractor.email,
                'currentRating': round(avg_rating, 2),
                'totalRatings': len(ratings),
                'totalComplaints': len(complaints),
                'totalProjects': len(projects),
                'riskLevel': 'High' if avg_rating < 2 else 'Medium' if avg_rating < 3.5 else 'Low',
                'recommendation': 'Review required' if avg_rating < 2 else 'Conditional approval' if avg_rating < 3.5 else 'Approve for future contracts',
                'createdAt': contractor.created_at
            })
        
        # Sort contractors
        if sort_by == 'rating':
            enriched_contractors.sort(key=lambda x: x['currentRating'], reverse=(order == 'desc'))
        elif sort_by == 'complaints':
            enriched_contractors.sort(key=lambda x: x['totalComplaints'], reverse=(order == 'desc'))
        
        return Response({
            'count': len(enriched_contractors),
            'contractors': enriched_contractors
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Health check endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'Server is running',
        'timestamp': timezone.now()
    }, status=status.HTTP_200_OK)


# Combined view handlers for multiple HTTP methods
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def admin_roads(request):
    """Handle GET and POST requests for admin roads"""
    if request.method == 'GET':
        try:
            print('Fetching roads...')
            print(f'Headers: {request.headers}')
            roads = list(RoadProject.objects.all().order_by('-created_at'))
            print(f'Found {len(roads)} roads')
            
            roads_data = []
            for road in roads:
                try:
                    road_dict = {
                        'id': road.id,
                        'roadId': road.road_id if hasattr(road, 'road_id') and road.road_id else '',
                        'roadName': road.road_name if hasattr(road, 'road_name') and road.road_name else '',
                        'contractorId': road.contractor.id if hasattr(road, 'contractor') and road.contractor else None,
                        'contractorName': (road.contractor.name if hasattr(road, 'contractor') and road.contractor else 
                                         (road.contractor_name if hasattr(road, 'contractor_name') and road.contractor_name else '')),
                        'latitude': str(road.latitude) if hasattr(road, 'latitude') and road.latitude is not None else '',
                        'longitude': str(road.longitude) if hasattr(road, 'longitude') and road.longitude is not None else '',
                        'address': road.address if hasattr(road, 'address') and road.address else '',
                        'status': road.status if hasattr(road, 'status') and road.status else 'Active',
                        'constructionDate': road.construction_date.isoformat() if hasattr(road, 'construction_date') and road.construction_date else None,
                        'completionDate': road.completion_date.isoformat() if hasattr(road, 'completion_date') and road.completion_date else None,
                        'warrantyPeriodYears': road.warranty_period_years if hasattr(road, 'warranty_period_years') else 10,
                        'createdAt': road.created_at.isoformat() if hasattr(road, 'created_at') and road.created_at else None,
                    }
                    roads_data.append(road_dict)
                except Exception as inner_e:
                    print(f'Error processing road {road.id}: {inner_e}')
                    import traceback
                    traceback.print_exc()
                    continue
            
            return Response({
                'count': len(roads_data),
                'roads': roads_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f'Roads GET error: {e}')
            import traceback
            traceback.print_exc()
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        # Handle POST - Add new road
        try:
            data = request.data
            
            # Validation
            if not data.get('roadId') or not data.get('roadName'):
                return Response({'error': 'Road ID and Road Name are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if road already exists
            if RoadProject.objects.filter(road_id=data['roadId']).exists():
                return Response({'error': 'Road with this ID already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify contractor if provided
            contractor = None
            if data.get('contractorId'):
                try:
                    contractor = Contractor.objects.get(id=data['contractorId'])
                except Contractor.DoesNotExist:
                    return Response({'error': 'Contractor not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate and convert latitude/longitude
            latitude = None
            longitude = None
            if data.get('latitude'):
                try:
                    latitude = float(data['latitude'])
                    if latitude < -90 or latitude > 90:
                        latitude = None  # Invalid latitude, set to None
                except (ValueError, TypeError):
                    latitude = None
            
            if data.get('longitude'):
                try:
                    longitude = float(data['longitude'])
                    if longitude < -180 or longitude > 180:
                        longitude = None  # Invalid longitude, set to None
                except (ValueError, TypeError):
                    longitude = None
            
            # Generate QR Code data
            import json
            qr_code_data = json.dumps({
                'roadId': data['roadId'],
                'roadName': data['roadName'],
                'timestamp': timezone.now().isoformat()
            })
            
            # Calculate warranty end date
            warranty_years = data.get('warrantyPeriodYears', 10)
            warranty_end_date = timezone.now() + timezone.timedelta(days=warranty_years * 365)
            
            # Create new road
            road = RoadProject.objects.create(
                road_id=data['roadId'],
                road_name=data['roadName'],
                contractor=contractor,
                contractor_name=data.get('contractorName'),
                latitude=latitude,
                longitude=longitude,
                address=data.get('address'),
                construction_date=data.get('constructionDate', timezone.now()),
                completion_date=data.get('completionDate', timezone.now()),
                warranty_period_years=warranty_years,
                warranty_end_date=warranty_end_date,
                qr_code_data=qr_code_data,
                project_cost=data.get('projectCost'),
                road_length=data.get('roadLength'),
                status='Active'
            )
            
            road_data = {
                'id': road.id,
                'roadId': road.road_id,
                'roadName': road.road_name,
                'contractorId': road.contractor.id if road.contractor else None,
                'contractorName': road.contractor.name if road.contractor else road.contractor_name,
                'latitude': str(road.latitude) if road.latitude else '',
                'longitude': str(road.longitude) if road.longitude else '',
                'address': road.address or '',
                'status': road.status or 'Active',
            }
            
            return Response({
                'message': 'Road added successfully',
                'road': road_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error adding road: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_road_detail(request, road_id):
    """Handle PUT and DELETE for road detail"""
    if request.method == 'PUT':
        return admin_update_road(request, road_id)
    elif request.method == 'DELETE':
        return admin_delete_road(request, road_id)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def contractors(request):
    """Handle GET and POST for contractors"""
    if request.method == 'GET':
        try:
            sort_by = request.GET.get('sortBy', 'rating')
            order = request.GET.get('order', 'desc')
            
            contractors_list = list(Contractor.objects.all())
            enriched_contractors = []
            
            for contractor in contractors_list:
                try:
                    ratings = list(Rating.objects.filter(contractor=contractor))
                    avg_rating = sum(r.rating_value for r in ratings) / len(ratings) if len(ratings) > 0 else 0
                    
                    projects = list(RoadProject.objects.filter(contractor=contractor))
                    project_ids = [p.id for p in projects] if projects else []
                    
                    # Only query complaints if there are project IDs
                    if project_ids:
                        complaints = list(Complaint.objects.filter(road_id__in=project_ids))
                    else:
                        complaints = []
                    
                    enriched_contractors.append({
                        'id': contractor.id,
                        'contractorId': contractor.contractor_id if contractor.contractor_id else '',
                        'name': contractor.name if contractor.name else '',
                        'email': contractor.email if contractor.email else '',
                        'currentRating': round(avg_rating, 2) if avg_rating else 0,
                        'totalRatings': len(ratings),
                        'totalComplaints': len(complaints),
                        'totalProjects': len(projects),
                        'riskLevel': 'High' if avg_rating < 2 else 'Medium' if avg_rating < 3.5 else 'Low',
                        'recommendation': 'Review required' if avg_rating < 2 else 'Conditional approval' if avg_rating < 3.5 else 'Approve for future contracts',
                        'createdAt': contractor.created_at.isoformat() if hasattr(contractor, 'created_at') and contractor.created_at else None
                    })
                except Exception as inner_e:
                    print(f'Error processing contractor {contractor.id}: {inner_e}')
                    continue
            
            if sort_by == 'rating':
                enriched_contractors.sort(key=lambda x: x['currentRating'], reverse=(order == 'desc'))
            elif sort_by == 'complaints':
                enriched_contractors.sort(key=lambda x: x['totalComplaints'], reverse=(order == 'desc'))
            
            return Response({
                'count': len(enriched_contractors),
                'contractors': enriched_contractors
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f'Contractors GET error: {e}')
            import traceback
            traceback.print_exc()
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    elif request.method == 'POST':
        try:
            data = request.data
            
            if not data.get('contractorId') or not data.get('name') or not data.get('email'):
                return Response({'error': 'Contractor ID, name, and email are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if Contractor.objects.filter(contractor_id=data['contractorId']).exists():
                return Response({'error': 'Contractor with this ID already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            if Contractor.objects.filter(email=data['email']).exists():
                return Response({'error': 'Contractor with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            contractor = Contractor.objects.create(
                contractor_id=data['contractorId'],
                name=data['name'],
                email=data['email'],
                password='hashed_password_here',
                current_rating=5.0,
                total_complaints=0,
                total_projects=0
            )
            
            return Response({
                'message': 'Contractor created successfully',
                'contractor': {
                    'id': contractor.id,
                    'contractorId': contractor.contractor_id,
                    'name': contractor.name,
                    'email': contractor.email,
                    'currentRating': contractor.current_rating,
                    'totalComplaints': contractor.total_complaints,
                    'totalProjects': contractor.total_projects
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f'Error creating contractor: {e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

