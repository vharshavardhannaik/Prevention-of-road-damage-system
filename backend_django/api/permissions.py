from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    
    def has_permission(self, request, view):
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            print(f'Permission denied: No auth header or wrong format')
            return False
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode the JWT token
            payload = jwt.decode(
                token,
                settings.SIMPLE_JWT['SIGNING_KEY'],
                algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            )
            
            print(f'Token decoded successfully: {payload}')
            
            # Check if the user has admin role
            role = payload.get('role', '')
            if role not in ['admin', 'super_admin']:
                print(f'Permission denied: Invalid role {role}')
                return False
            
            # Attach the decoded admin info to the request
            request.admin = payload
            return True
            
        except jwt.ExpiredSignatureError as e:
            print(f'Token expired: {e}')
            return False
        except jwt.InvalidTokenError as e:
            print(f'Invalid token: {e}')
            return False
        except Exception as e:
            print(f'Permission error: {e}')
            return False


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow super admin users.
    """
    
    def has_permission(self, request, view):
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return False
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode the JWT token
            payload = jwt.decode(
                token,
                settings.SIMPLE_JWT['SIGNING_KEY'],
                algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            )
            
            # Check if the user has super_admin role
            role = payload.get('role', '')
            if role != 'super_admin':
                return False
            
            # Attach the decoded admin info to the request
            request.admin = payload
            return True
            
        except jwt.ExpiredSignatureError:
            return False
        except jwt.InvalidTokenError:
            return False
        except Exception:
            return False
