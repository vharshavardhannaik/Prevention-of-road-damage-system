"""
Rating Calculation Algorithm

The rating system evaluates contractors based on:
1. Number of complaints received during warranty period
2. Severity of complaints
3. Resolution rate and time
4. Project history and track record
"""

from datetime import datetime, timedelta
from django.utils import timezone


def calculate_contractor_rating(contractor, road_projects, all_complaints):
    """
    Calculate contractor rating based on projects and complaints
    
    Args:
        contractor: Contractor model instance
        road_projects: QuerySet of RoadProject instances
        all_complaints: QuerySet of Complaint instances
    
    Returns:
        dict with finalRating, deductions, totalDeduction, ratingCategory, timestamp
    """
    now = timezone.now()
    rating_points = 5.0  # Start with perfect 5 stars
    deductions = []
    
    # Iterate through all projects of the contractor
    for project in road_projects:
        warranty_end_date = project.warranty_end_date
        is_under_warranty = now <= warranty_end_date if warranty_end_date else False
        
        days_into_warranty = (now - project.construction_date).days
        total_warranty_days = project.warranty_period_years * 365
        warranty_percentage = (days_into_warranty / total_warranty_days) * 100
        
        # Get complaints for this specific road
        project_complaints = [c for c in all_complaints if c.road_id == project.id]
        
        if len(project_complaints) > 0:
            # Rule 1: Complaint count deduction (during warranty period)
            if is_under_warranty:
                complaint_deduction = min(len(project_complaints) * 0.3, 2.0)
                rating_points -= complaint_deduction
                deductions.append({
                    'reason': f"{len(project_complaints)} complaints during warranty (Road: {project.road_name})",
                    'deduction': complaint_deduction
                })
            else:
                # Post-warranty complaints have lesser impact
                post_warranty_deduction = min(len(project_complaints) * 0.1, 0.5)
                rating_points -= post_warranty_deduction
                deductions.append({
                    'reason': f"{len(project_complaints)} complaints post-warranty (Road: {project.road_name})",
                    'deduction': post_warranty_deduction
                })
            
            # Rule 2: Severity-based deduction
            severity_scores = {
                'Critical': 1.0,
                'High': 0.7,
                'Medium': 0.4,
                'Low': 0.1
            }
            
            severity_deduction = sum(
                severity_scores.get(complaint.severity, 0.4)
                for complaint in project_complaints
            )
            
            rating_points -= severity_deduction
            deductions.append({
                'reason': 'Severity impact from complaints',
                'deduction': severity_deduction
            })
            
            # Rule 3: Resolution rate (unresolved complaints penalty)
            unresolved_complaints = [
                c for c in project_complaints
                if c.status in ['Open', 'Under Review']
            ]
            if len(unresolved_complaints) > 0:
                resolution_penalty = min(len(unresolved_complaints) * 0.2, 1.0)
                rating_points -= resolution_penalty
                deductions.append({
                    'reason': f"{len(unresolved_complaints)} unresolved complaints",
                    'deduction': resolution_penalty
                })
            
            # Rule 4: Time since complaint (recent complaints have more impact)
            recent_complaints = [
                c for c in project_complaints
                if (now - c.created_at).days <= 30
            ]
            
            if len(recent_complaints) > 0:
                recency_penalty = min(len(recent_complaints) * 0.15, 0.75)
                rating_points -= recency_penalty
                deductions.append({
                    'reason': f"Recent complaints (within 30 days): {len(recent_complaints)}",
                    'deduction': recency_penalty
                })
    
    # Ensure rating stays within 0-5 range
    rating_points = max(0, min(5.0, rating_points))
    
    return {
        'finalRating': round(rating_points, 2),
        'deductions': deductions,
        'totalDeduction': 5.0 - rating_points,
        'ratingCategory': get_rating_category(rating_points),
        'timestamp': now
    }


def get_rating_category(rating):
    """Categorize rating for display purposes"""
    if rating >= 4.5:
        return 'Excellent'
    elif rating >= 4.0:
        return 'Very Good'
    elif rating >= 3.0:
        return 'Good'
    elif rating >= 2.0:
        return 'Fair'
    else:
        return 'Poor'


def get_rating_color(rating):
    """Get rating color for UI display"""
    if rating >= 4.5:
        return '#10b981'  # Green
    elif rating >= 4.0:
        return '#3b82f6'  # Blue
    elif rating >= 3.0:
        return '#f59e0b'  # Amber
    elif rating >= 2.0:
        return '#ef6354'  # Orange
    else:
        return '#dc2626'  # Red


def get_risk_level(rating):
    """Get risk level for government contract decisions"""
    if rating >= 4.5:
        return {'level': 'Very Low', 'recommendation': 'Approve for future contracts'}
    elif rating >= 4.0:
        return {'level': 'Low', 'recommendation': 'Approve with monitoring'}
    elif rating >= 3.0:
        return {'level': 'Medium', 'recommendation': 'Conditional approval'}
    elif rating >= 2.0:
        return {'level': 'High', 'recommendation': 'Restricted participation'}
    else:
        return {'level': 'Very High', 'recommendation': 'Blacklist from contracts'}


def calculate_performance_score(avg_rating, total_complaints):
    """Calculate performance score for contractors"""
    rating_weight = 60
    complaint_weight = 40
    
    rating_score = (float(avg_rating) / 5) * rating_weight
    complaint_score = max(0, (100 - (total_complaints * 5)) / 100) * complaint_weight
    
    return round(rating_score + complaint_score, 2)


def get_performance_rank(score):
    """Get performance rank based on score"""
    if score >= 85:
        return 'Excellent'
    elif score >= 70:
        return 'Good'
    elif score >= 50:
        return 'Average'
    else:
        return 'Poor'


def get_rating_distribution(ratings):
    """Get rating distribution"""
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating in ratings:
        rating_val = int(rating.rating_value)
        if rating_val in distribution:
            distribution[rating_val] += 1
    return distribution
