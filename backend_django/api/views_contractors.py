from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
import qrcode
import io
import base64

from .models import Contractor, RoadProject, Complaint, Rating
from .utils import (
    calculate_contractor_rating, get_risk_level,
    calculate_performance_score, get_performance_rank, get_rating_distribution
)


@api_view(['POST'])
@permission_classes([AllowAny])
def contractor_rate(request):
    """Submit a rating for a contractor"""
    try:
        data = request.data
        contractor_id = data.get('contractorId')
        rating_value = data.get('ratingValue')
        
        if not contractor_id:
            return Response({'error': 'Contractor ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not rating_value or rating_value < 1 or rating_value > 5:
            return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify contractor exists
        try:
            contractor = Contractor.objects.get(id=contractor_id)
        except Contractor.DoesNotExist:
            return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create rating
        rating = Rating.objects.create(
            contractor=contractor,
            road_id=data.get('roadId'),
            rating_value=rating_value,
            user_email=data.get('userEmail', 'anonymous@example.com'),
            user_id=data.get('userId', 'anonymous'),
            comment=data.get('comment')
        )
        
        # Recalculate contractor's average rating
        all_ratings = Rating.objects.filter(contractor=contractor)
        avg_rating = sum(r.rating_value for r in all_ratings) / len(all_ratings) if all_ratings else 5.0
        
        contractor.current_rating = avg_rating
        contractor.save()
        
        return Response({
            'message': 'Rating submitted successfully',
            'rating': {
                'id': rating.id,
                'contractorId': rating.contractor_id,
                'roadId': rating.road_id,
                'ratingValue': rating.rating_value,
                'comment': rating.comment,
                'createdAt': rating.created_at
            },
            'contractorAvgRating': round(avg_rating, 2)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_detail(request, contractor_id):
    """Get detailed information about a specific contractor"""
    try:
        contractor = Contractor.objects.get(id=contractor_id)
        projects = RoadProject.objects.filter(contractor=contractor)
        project_ids = [p.id for p in projects]
        complaints = Complaint.objects.filter(road_id__in=project_ids)
        
        rating_result = calculate_contractor_rating(contractor, list(projects), list(complaints))
        risk_level = get_risk_level(rating_result['finalRating'])
        
        return Response({
            'contractor': {
                'id': contractor.id,
                'contractorId': contractor.contractor_id,
                'name': contractor.name,
                'email': contractor.email,
                'currentRating': rating_result['finalRating'],
                'ratingDeductions': rating_result['deductions'],
                'totalComplaints': len(complaints),
                'resolvedComplaints': len([c for c in complaints if c.status == 'Resolved']),
                'pendingComplaints': len([c for c in complaints if c.status in ['Open', 'Under Review']]),
                'riskLevel': risk_level['level'],
                'recommendation': risk_level['recommendation'],
                'ratingCategory': rating_result['ratingCategory']
            }
        }, status=status.HTTP_200_OK)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_projects(request, contractor_id):
    """Get all projects of a contractor"""
    try:
        projects = RoadProject.objects.filter(contractor_id=contractor_id)
        
        projects_data = []
        for project in projects:
            complaints = Complaint.objects.filter(road=project)
            projects_data.append({
                'id': project.id,
                'roadId': project.road_id,
                'roadName': project.road_name,
                'address': project.address,
                'status': project.status,
                'constructionDate': project.construction_date,
                'completionDate': project.completion_date,
                'warrantyEndDate': project.warranty_end_date,
                'complaints': len(complaints),
                'createdAt': project.created_at
            })
        
        return Response({
            'count': len(projects_data),
            'projects': projects_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_performance(request, contractor_id):
    """Get detailed performance metrics for a contractor"""
    try:
        contractor = Contractor.objects.get(id=contractor_id)
        ratings = Rating.objects.filter(contractor=contractor)
        projects = RoadProject.objects.filter(contractor=contractor)
        
        avg_rating = sum(r.rating_value for r in ratings) / len(ratings) if ratings else 0
        performance_score = calculate_performance_score(avg_rating, contractor.total_complaints)
        
        return Response({
            'contractor': {
                'id': contractor.id,
                'name': contractor.name,
                'contractorId': contractor.contractor_id
            },
            'performance': {
                'averageRating': round(avg_rating, 2),
                'totalRatings': len(ratings),
                'totalComplaints': contractor.total_complaints,
                'totalProjects': len(projects),
                'performanceScore': performance_score,
                'performanceRank': get_performance_rank(performance_score),
                'ratingDistribution': get_rating_distribution(ratings),
                'recentRatings': list(ratings.order_by('-created_at')[:5].values())
            }
        }, status=status.HTTP_200_OK)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_performance_dashboard(request):
    """Get all contractors ranked by performance"""
    try:
        contractors = Contractor.objects.all()
        performance_data = []
        
        for contractor in contractors:
            ratings = Rating.objects.filter(contractor=contractor)
            avg_rating = sum(r.rating_value for r in ratings) / len(ratings) if ratings else 0
            performance_score = calculate_performance_score(avg_rating, contractor.total_complaints)
            
            performance_data.append({
                'id': contractor.id,
                'contractorId': contractor.contractor_id,
                'name': contractor.name,
                'averageRating': round(avg_rating, 2),
                'totalRatings': len(ratings),
                'totalComplaints': contractor.total_complaints,
                'totalProjects': contractor.total_projects,
                'performanceScore': performance_score,
                'status': 'TOP' if contractor.total_complaints < 5 and avg_rating >= 4 else
                         'BOTTOM' if contractor.total_complaints > 15 or avg_rating < 3 else 'AVERAGE'
            })
        
        # Sort by performance score
        performance_data.sort(key=lambda x: x['performanceScore'], reverse=True)
        
        top_performers = [c for c in performance_data if c['status'] == 'TOP']
        bottom_performers = [c for c in performance_data if c['status'] == 'BOTTOM']
        average_performers = [c for c in performance_data if c['status'] == 'AVERAGE']
        
        return Response({
            'totalContractors': len(performance_data),
            'topPerformers': top_performers,
            'averagePerformers': average_performers,
            'bottomPerformers': bottom_performers,
            'allContractors': performance_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_all_contractor_qr(request):
    """Generate QR codes for all contractors"""
    try:
        contractors = Contractor.objects.all()
        generated_count = 0
        
        for contractor in contractors:
            # Generate QR code URL
            qr_url = contractor.get_qr_url()
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            # Save QR code to contractor
            contractor.qr_code = f"data:image/png;base64,{img_str}"
            contractor.save()
            generated_count += 1
        
        return Response({
            'message': f'Successfully generated QR codes for {generated_count} contractors',
            'generated': generated_count,
            'total': contractors.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_contractor_qr(request, contractor_id):
    """Generate QR code for a specific contractor"""
    try:
        contractor = Contractor.objects.get(contractor_id=contractor_id)
        
        # Generate QR code URL
        qr_url = contractor.get_qr_url()
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        # Save QR code to contractor
        contractor.qr_code = f"data:image/png;base64,{img_str}"
        contractor.save()
        
        return Response({
            'contractorId': contractor.contractor_id,
            'name': contractor.name,
            'qrCode': contractor.qr_code,
            'qrUrl': qr_url
        }, status=status.HTTP_200_OK)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_contractor_qr(request, contractor_id):
    """Get QR code for a specific contractor"""
    try:
        contractor = Contractor.objects.get(contractor_id=contractor_id)
        
        # Generate QR if it doesn't exist
        if not contractor.qr_code:
            qr_url = contractor.get_qr_url()
            
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            contractor.qr_code = f"data:image/png;base64,{img_str}"
            contractor.save()
        
        return Response({
            'contractorId': contractor.contractor_id,
            'name': contractor.name,
            'qrCode': contractor.qr_code,
            'qrUrl': contractor.get_qr_url()
        }, status=status.HTTP_200_OK)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_contractor_public_info(request, contractor_id):
    """Get public contractor information for feedback page"""
    try:
        contractor = Contractor.objects.get(contractor_id=contractor_id)
        
        return Response({
            'contractorId': contractor.contractor_id,
            'name': contractor.name,
            'currentRating': contractor.current_rating,
            'totalComplaints': contractor.total_complaints,
            'totalProjects': contractor.total_projects,
        }, status=status.HTTP_200_OK)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_public_rating(request, contractor_id):
    """Submit a public rating for a contractor (no auth required)"""
    try:
        contractor = Contractor.objects.get(contractor_id=contractor_id)
        
        rating_value = request.data.get('ratingValue')
        comment = request.data.get('comment', '')
        
        if not rating_value or rating_value < 1 or rating_value > 5:
            return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create rating
        rating = Rating.objects.create(
            contractor=contractor,
            rating_value=rating_value,
            user_email='public@feedback.com',
            user_id='public',
            comment=comment
        )
        
        # Recalculate contractor's average rating
        all_ratings = Rating.objects.filter(contractor=contractor)
        avg_rating = sum(r.rating_value for r in all_ratings) / len(all_ratings) if all_ratings else 5.0
        
        contractor.current_rating = avg_rating
        contractor.save()
        
        return Response({
            'message': 'Rating submitted successfully',
            'newAverageRating': contractor.current_rating
        }, status=status.HTTP_201_CREATED)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_public_complaint(request, contractor_id):
    """Submit a public complaint for a contractor (no auth required)"""
    try:
        contractor = Contractor.objects.get(contractor_id=contractor_id)
        
        description = request.data.get('description')
        location = request.data.get('location', '')
        
        if not description:
            return Response({'error': 'Description is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create complaint
        complaint = Complaint.objects.create(
            contractor=contractor,
            user_email='public@feedback.com',
            user_id='public',
            description=description,
            location=location,
            status='Open'
        )
        
        # Increment contractor's complaint count
        contractor.total_complaints += 1
        contractor.save()
        
        return Response({
            'message': 'Complaint submitted successfully',
            'complaintId': complaint.complaint_id
        }, status=status.HTTP_201_CREATED)
        
    except Contractor.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

