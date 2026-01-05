from django.shortcuts import render

# Create your views here.
# accounts/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
try:
    from rest_framework_simplejwt.tokens import RefreshToken
except Exception:
    RefreshToken = None
import json
from .models import User
from .models import Address


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    if RefreshToken is None:
        raise RuntimeError("rest_framework_simplejwt is not available; please install 'djangorestframework-simplejwt'")
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
@require_http_methods(["PUT"])
def update_profile(request):
    """Update user profile details"""
    # Verify auth
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    
    try:
        # Get user (Simplified for now, ideally use DRF auth class)
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_authenticator = JWTAuthentication()
        validated_token = jwt_authenticator.get_validated_token(auth_header.split(' ')[1])
        user = jwt_authenticator.get_user(validated_token)
        
        data = json.loads(request.body)
        
        # Update fields
        if 'first_name' in data: user.first_name = data['first_name']
        if 'last_name' in data: user.last_name = data['last_name']
        if 'phone' in data: user.phone = data['phone']
        
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@require_http_methods(["GET", "POST"])
@csrf_exempt
def address_list(request):
    """List all addresses or create new one"""
    # Verify auth (Copy auth logic from above or use decorator if setup)
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        
    from rest_framework_simplejwt.authentication import JWTAuthentication
    jwt_authenticator = JWTAuthentication()
    validated_token = jwt_authenticator.get_validated_token(auth_header.split(' ')[1])
    user = jwt_authenticator.get_user(validated_token)

    if request.method == "GET":
        addresses = Address.objects.filter(user=user).order_by('-is_default', '-created_at')
        data = []
        for addr in addresses:
            data.append({
                'id': addr.id,
                'name': addr.name,
                'phone': addr.phone,
                'address_line': addr.address_line,
                'city': addr.city,
                'state': addr.state,
                'pincode': addr.pincode,
                'is_default': addr.is_default
            })
        return JsonResponse({'success': True, 'addresses': data})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            address = Address.objects.create(
                user=user,
                name=data.get('name'),
                phone=data.get('phone'),
                address_line=data.get('address_line'),
                city=data.get('city'),
                state=data.get('state'),
                pincode=data.get('pincode'),
                is_default=data.get('is_default', False)
            )
            return JsonResponse({'success': True, 'message': 'Address added'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@require_http_methods(["PUT", "DELETE"])
@csrf_exempt
def address_detail(request, address_id):
    """Update or delete specific address"""
    # Verify auth... (Simplified for brevity, ensure you include the auth check lines)
    auth_header = request.headers.get('Authorization')
    from rest_framework_simplejwt.authentication import JWTAuthentication
    jwt_authenticator = JWTAuthentication()
    validated_token = jwt_authenticator.get_validated_token(auth_header.split(' ')[1])
    user = jwt_authenticator.get_user(validated_token)

    try:
        address = Address.objects.get(id=address_id, user=user)
    except Address.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Address not found'}, status=404)

    if request.method == "DELETE":
        address.delete()
        return JsonResponse({'success': True, 'message': 'Address deleted'})

    elif request.method == "PUT":
        data = json.loads(request.body)
        address.name = data.get('name', address.name)
        address.phone = data.get('phone', address.phone)
        address.address_line = data.get('address_line', address.address_line)
        address.city = data.get('city', address.city)
        address.state = data.get('state', address.state)
        address.pincode = data.get('pincode', address.pincode)
        if 'is_default' in data:
            address.is_default = data['is_default']
            # Note: The save method in model handles setting other addresses to non-default
        
        address.save()
        return JsonResponse({'success': True, 'message': 'Address updated'})

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """Register a new user"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Validate required fields
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    
    if not all([username, email, password, phone]):
        return JsonResponse({
            'success': False,
            'error': 'username, email, password, and phone are required'
        }, status=400)
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'success': False,
            'error': 'Username already exists'
        }, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({
            'success': False,
            'error': 'Email already registered'
        }, status=400)
    
    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            phone=phone,
            role='CUSTOMER'
        )
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return JsonResponse({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
            },
            'tokens': tokens
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """Login user and return JWT tokens"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return JsonResponse({
            'success': False,
            'error': 'username and password are required'
        }, status=400)
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    
    if user is None:
        return JsonResponse({
            'success': False,
            'error': 'Invalid credentials'
        }, status=401)
    
    if not user.is_active:
        return JsonResponse({
            'success': False,
            'error': 'Account is disabled'
        }, status=401)
    
    # Generate tokens
    tokens = get_tokens_for_user(user)
    
    return JsonResponse({
        'success': True,
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
        },
        'tokens': tokens
    })


@csrf_exempt
@require_http_methods(["POST"])
def refresh_token(request):
    """Refresh access token using refresh token"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    refresh_token = data.get('refresh')
    
    if not refresh_token:
        return JsonResponse({
            'success': False,
            'error': 'refresh token is required'
        }, status=400)
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        return JsonResponse({
            'success': True,
            'access': access_token
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Invalid or expired refresh token'
        }, status=401)


@require_http_methods(["GET"])
def me(request):
    """Get current user info (requires authentication)"""
    
    # Check if user is authenticated
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({
            'success': False,
            'error': 'Authentication required'
        }, status=401)
    
    # For now, let's use simple approach
    # In production, you'd use DRF's authentication classes
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        
        jwt_authenticator = JWTAuthentication()
        validated_token = jwt_authenticator.get_validated_token(auth_header.split(' ')[1])
        user = jwt_authenticator.get_user(validated_token)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Invalid token'
        }, status=401)