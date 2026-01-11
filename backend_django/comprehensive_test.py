import requests
import json

print("=" * 60)
print("COMPREHENSIVE LOGIN TEST")
print("=" * 60)

# Test 1: Health Check
print("\n1. Testing Backend Health...")
try:
    response = requests.get("http://localhost:8000/api/health")
    print(f"   ✓ Backend is running (Status: {response.status_code})")
except Exception as e:
    print(f"   ✗ Backend health check failed: {e}")
    exit(1)

# Test 2: Login API
print("\n2. Testing Login API...")
url = "http://localhost:8000/api/admin/login"
data = {
    "username": "admin",
    "password": "Admin@456"
}

try:
    response = requests.post(url, json=data)
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"   ✓ Login successful!")
        print(f"   Token: {result.get('token', 'N/A')[:50]}...")
        print(f"   Admin Username: {result.get('admin', {}).get('username', 'N/A')}")
        print(f"   Admin Role: {result.get('admin', {}).get('role', 'N/A')}")
    else:
        print(f"   ✗ Login failed")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 3: CORS Headers
print("\n3. Testing CORS Headers...")
try:
    response = requests.options(
        url,
        headers={
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    )
    print(f"   Status Code: {response.status_code}")
    cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
    if cors_headers:
        print(f"   ✓ CORS headers present:")
        for key, value in cors_headers.items():
            print(f"     - {key}: {value}")
    else:
        print(f"   ⚠ No CORS headers found")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
