from django.urls import path
from . import views
from . import views_contractors
from . import views_complaints_roads

urlpatterns = [
    # Health check
    path('health', views.health_check, name='health_check'),
    
    # Admin endpoints
    path('admin/register', views.admin_register, name='admin_register'),
    path('admin/login', views.admin_login, name='admin_login'),
    path('admin/profile', views.admin_profile, name='admin_profile'),
    path('admin/roads', views.admin_roads, name='admin_roads'),  # GET, POST
    path('admin/roads/<int:road_id>', views.admin_road_detail, name='admin_road_detail'),  # PUT, DELETE
    path('admin/roads/<int:road_id>/assign-contractor', views.admin_assign_contractor, name='admin_assign_contractor'),
    path('admin/contractors', views.admin_get_contractors, name='admin_get_contractors'),
    
    # Contractor endpoints
    path('contractors', views.contractors, name='contractors'),  # GET, POST
    path('contractors/rate', views_contractors.contractor_rate, name='contractor_rate'),
    path('contractors/<int:contractor_id>', views_contractors.contractor_detail, name='contractor_detail'),
    path('contractors/<int:contractor_id>/projects', views_contractors.contractor_projects, name='contractor_projects'),
    path('contractors/<int:contractor_id>/rate', views_contractors.contractor_rate, name='contractor_rate_by_id'),
    path('contractors/<int:contractor_id>/performance', views_contractors.contractor_performance, name='contractor_performance'),
    path('contractors/performance/dashboard', views_contractors.contractor_performance_dashboard, name='contractor_performance_dashboard'),
    
    # QR Code endpoints
    path('contractors/generate-all-qr', views_contractors.generate_all_contractor_qr, name='generate_all_contractor_qr'),
    path('contractors/<str:contractor_id>/qr/generate', views_contractors.generate_contractor_qr, name='generate_contractor_qr'),
    path('contractors/<str:contractor_id>/qr', views_contractors.get_contractor_qr, name='get_contractor_qr'),
    
    # Public feedback endpoints (no auth required)
    path('public/contractor/<str:contractor_id>', views_contractors.get_contractor_public_info, name='get_contractor_public_info'),
    path('public/contractor/<str:contractor_id>/rating', views_contractors.submit_public_rating, name='submit_public_rating'),
    path('public/contractor/<str:contractor_id>/complaint', views_contractors.submit_public_complaint, name='submit_public_complaint'),
    
    # Complaint endpoints
    path('complaints', views_complaints_roads.complaints, name='complaints'),  # GET, POST
    path('complaints/<int:road_id>', views_complaints_roads.complaint_by_road, name='complaint_by_road'),
    path('complaints/<int:complaint_id>', views_complaints_roads.complaint_update, name='complaint_update'),  # PUT
    
    # Road endpoints
    path('roads/<str:road_id>', views_complaints_roads.road_detail, name='road_detail'),
    path('roads', views_complaints_roads.road_list, name='road_list'),
]
