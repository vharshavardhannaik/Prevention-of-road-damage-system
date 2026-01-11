from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone

from .models import Complaint, RoadProject, Contractor
from .utils import calculate_contractor_rating


@api_view(['POST'])
@permission_classes([AllowAny])
def complaint_create(request):
    """Submit a new complaint for a road"""
    try:
        data = request.data
        
        # Validate required fields
        if not data.get('roadId') or not data.get('damageType') or not data.get('description'):
            return Response({'error': 'Missing required fields: roadId, damageType, description'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch the road project by roadId (string field)
        try:
            road_project = RoadProject.objects.get(road_id=data['roadId'])
        except RoadProject.DoesNotExist:
            return Response({'error': 'Road project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create complaint
        complaint_id = f"COMPLAINT-{int(timezone.now().timestamp() * 1000)}"
        location = data.get('location', {})
        
        complaint = Complaint.objects.create(
            complaint_id=complaint_id,
            road=road_project,
            user_id=data.get('userId', 'anonymous'),
            user_email=data.get('userEmail'),
            user_phone=data.get('userPhone'),
            damage_type=data['damageType'],
            description=data['description'],
            photo_url=data.get('photoUrl'),
            latitude=location.get('latitude') if location else None,
            longitude=location.get('longitude') if location else None,
            severity=data.get('severity', 'Medium')
        )
        
        # Update contractor's total complaints and recalculate rating
        updated_rating = None
        if road_project.contractor:
            contractor = road_project.contractor
            contractor.total_complaints += 1
            
            # Recalculate rating
            contractor_projects = RoadProject.objects.filter(contractor=contractor)
            project_ids = [p.id for p in contractor_projects]
            all_complaints = Complaint.objects.filter(road_id__in=project_ids)
            
            rating_result = calculate_contractor_rating(contractor, list(contractor_projects), list(all_complaints))
            contractor.current_rating = rating_result['finalRating']
            updated_rating = rating_result['finalRating']
            contractor.save()
        
        return Response({
            'message': 'Complaint submitted successfully',
            'complaint': {
                'id': complaint.id,
                'complaintId': complaint.complaint_id,
                'roadId': road_project.id,
                'damageType': complaint.damage_type,
                'description': complaint.description,
                'status': complaint.status,
                'severity': complaint.severity,
                'createdAt': complaint.created_at
            },
            'updatedRating': updated_rating
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def complaint_list(request):
    """Get all complaints"""
    try:
        complaints = Complaint.objects.all().order_by('-created_at')
        
        complaints_data = []
        for complaint in complaints:
            complaints_data.append({
                'id': complaint.id,
                'complaintId': complaint.complaint_id,
                'roadId': complaint.road.road_id if complaint.road else None,
                'road': {
                    'roadId': complaint.road.road_id,
                    'roadName': complaint.road.road_name,
                    'address': complaint.road.address
                } if complaint.road else None,
                'userId': complaint.user_id,
                'userEmail': complaint.user_email,
                'userPhone': complaint.user_phone,
                'damageType': complaint.damage_type,
                'description': complaint.description,
                'photoUrl': complaint.photo_url,
                'latitude': str(complaint.latitude) if complaint.latitude else None,
                'longitude': str(complaint.longitude) if complaint.longitude else None,
                'status': complaint.status,
                'severity': complaint.severity,
                'resolvedDate': complaint.resolved_date,
                'resolutionDescription': complaint.resolution_description,
                'createdAt': complaint.created_at,
                'updatedAt': complaint.updated_at
            })
        
        return Response({
            'count': len(complaints_data),
            'complaints': complaints_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def complaint_by_road(request, road_id):
    """Get all complaints for a specific road"""
    try:
        complaints = Complaint.objects.filter(road_id=road_id).order_by('-created_at')
        
        complaints_data = []
        for complaint in complaints:
            complaints_data.append({
                'id': complaint.id,
                'complaintId': complaint.complaint_id,
                'damageType': complaint.damage_type,
                'description': complaint.description,
                'status': complaint.status,
                'severity': complaint.severity,
                'createdAt': complaint.created_at
            })
        
        return Response({
            'count': len(complaints_data),
            'complaints': complaints_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
def complaint_update(request, complaint_id):
    """Update complaint status"""
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        data = request.data
        
        if data.get('status'):
            complaint.status = data['status']
            
        if data['status'] == 'Resolved':
            complaint.resolved_date = timezone.now()
            resolution = data.get('resolution', {})
            complaint.resolution_description = resolution.get('description')
        
        complaint.save()
        
        return Response({
            'message': 'Complaint updated successfully',
            'complaint': {
                'id': complaint.id,
                'complaintId': complaint.complaint_id,
                'status': complaint.status,
                'resolvedDate': complaint.resolved_date,
                'resolutionDescription': complaint.resolution_description
            }
        }, status=status.HTTP_200_OK)
        
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ROAD ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def road_detail(request, road_id):
    """Get road details by ID (roadId field, not database ID)"""
    try:
        road = RoadProject.objects.get(road_id=road_id)
        complaints = Complaint.objects.filter(road=road)
        
        return Response({
            'road': {
                'id': road.id,
                'roadId': road.road_id,
                'roadName': road.road_name,
                'contractorId': road.contractor_id,
                'contractorName': road.contractor_name,
                'contractor': {
                    'id': road.contractor.id,
                    'name': road.contractor.name,
                    'contractorId': road.contractor.contractor_id
                } if road.contractor else None,
                'latitude': str(road.latitude) if road.latitude else None,
                'longitude': str(road.longitude) if road.longitude else None,
                'address': road.address,
                'constructionDate': road.construction_date,
                'completionDate': road.completion_date,
                'warrantyPeriodYears': road.warranty_period_years,
                'warrantyEndDate': road.warranty_end_date,
                'qrCodeData': road.qr_code_data,
                'projectCost': str(road.project_cost) if road.project_cost else None,
                'roadLength': str(road.road_length) if road.road_length else None,
                'status': road.status,
                'complaints': [{
                    'id': c.id,
                    'complaintId': c.complaint_id,
                    'damageType': c.damage_type,
                    'status': c.status,
                    'severity': c.severity,
                    'createdAt': c.created_at
                } for c in complaints],
                'createdAt': road.created_at,
                'updatedAt': road.updated_at
            }
        }, status=status.HTTP_200_OK)
        
    except RoadProject.DoesNotExist:
        return Response({'error': 'Road not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def road_list(request):
    """Get all roads"""
    try:
        roads = RoadProject.objects.all().order_by('-created_at')
        
        roads_data = []
        for road in roads:
            roads_data.append({
                'id': road.id,
                'roadId': road.road_id,
                'roadName': road.road_name,
                'contractorId': road.contractor_id,
                'contractorName': road.contractor_name,
                'contractor': {
                    'id': road.contractor.id,
                    'name': road.contractor.name,
                    'contractorId': road.contractor.contractor_id
                } if road.contractor else None,
                'address': road.address,
                'status': road.status,
                'constructionDate': road.construction_date,
                'completionDate': road.completion_date,
                'warrantyEndDate': road.warranty_end_date,
                'createdAt': road.created_at
            })
        
        return Response({
            'count': len(roads_data),
            'roads': roads_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Combined view handlers
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def complaints(request):
    """Handle GET and POST for complaints"""
    if request.method == 'GET':
        try:
            complaints_list = Complaint.objects.all().order_by('-created_at')
            
            complaints_data = []
            for complaint in complaints_list:
                complaints_data.append({
                    'id': complaint.id,
                    'complaintId': complaint.complaint_id,
                    'roadId': complaint.road.road_id if complaint.road else None,
                    'road': {
                        'roadId': complaint.road.road_id,
                        'roadName': complaint.road.road_name,
                        'address': complaint.road.address
                    } if complaint.road else None,
                    'userId': complaint.user_id,
                    'userEmail': complaint.user_email,
                    'userPhone': complaint.user_phone,
                    'damageType': complaint.damage_type,
                    'description': complaint.description,
                    'photoUrl': complaint.photo_url,
                    'status': complaint.status,
                    'severity': complaint.severity,
                    'createdAt': complaint.created_at,
                    'updatedAt': complaint.updated_at
                })
            
            return Response({
                'count': len(complaints_data),
                'complaints': complaints_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        # Handle POST - Submit a new complaint for a road
        try:
            data = request.data
            
            # Validate required fields
            if not data.get('roadId') or not data.get('damageType') or not data.get('description'):
                return Response({'error': 'Missing required fields: roadId, damageType, description'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Fetch the road project by roadId (string field)
            try:
                road_project = RoadProject.objects.get(road_id=data['roadId'])
            except RoadProject.DoesNotExist:
                return Response({'error': 'Road project not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Create complaint
            complaint_id = f"COMPLAINT-{int(timezone.now().timestamp() * 1000)}"
            location = data.get('location', {})
            
            complaint = Complaint.objects.create(
                complaint_id=complaint_id,
                road=road_project,
                user_id=data.get('userId', 'anonymous'),
                user_email=data.get('userEmail'),
                user_phone=data.get('userPhone'),
                damage_type=data['damageType'],
                description=data['description'],
                photo_url=data.get('photoUrl'),
                latitude=location.get('latitude') if location else None,
                longitude=location.get('longitude') if location else None,
                severity=data.get('severity', 'Medium')
            )
            
            # Update contractor's total complaints and recalculate rating
            updated_rating = None
            if road_project.contractor:
                contractor = road_project.contractor
                contractor.total_complaints += 1
                
                # Recalculate rating
                contractor_projects = list(RoadProject.objects.filter(contractor=contractor))
                project_ids = [p.id for p in contractor_projects]
                all_complaints = list(Complaint.objects.filter(road_id__in=project_ids))
                
                rating_result = calculate_contractor_rating(contractor, contractor_projects, all_complaints)
                contractor.current_rating = rating_result['finalRating']
                updated_rating = rating_result['finalRating']
                contractor.save()
            
            return Response({
                'message': 'Complaint submitted successfully',
                'complaint': {
                    'id': complaint.id,
                    'complaintId': complaint.complaint_id,
                    'roadId': road_project.road_id,
                    'damageType': complaint.damage_type,
                    'description': complaint.description,
                    'status': complaint.status,
                    'severity': complaint.severity,
                    'createdAt': complaint.created_at.isoformat() if complaint.created_at else None
                },
                'updatedRating': updated_rating
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error creating complaint: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

