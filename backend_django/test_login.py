import requests
import json

# Test admin login
url = "http://localhost:5000/api/admin/login"
data = {
    "username": "admin",
    "password": "Admin@456"
}

print("Testing admin login...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("\nSending request...")

try:
    response = requests.post(url, json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("\n✅ LOGIN SUCCESSFUL!")
        print("Token received:", response.json().get('token', '')[:50] + "...")
    else:
        print("\n❌ LOGIN FAILED!")
        print("Error:", response.json().get('error', 'Unknown error'))
except Exception as e:
    print(f"\n❌ Request failed: {e}")
