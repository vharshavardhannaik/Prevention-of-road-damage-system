import requests
import json

print("Testing Smart Road System APIs...")
print("=" * 50)

# Test health endpoint
try:
    response = requests.get('http://localhost:8000/api/health')
    print(f"\n✓ Health Check: {response.status_code}")
    print(f"  Response: {response.text}")
except Exception as e:
    print(f"\n✗ Health Check Failed: {e}")

# Test contractors endpoint
try:
    response = requests.get('http://localhost:8000/api/contractors')
    print(f"\n✓ Contractors: {response.status_code}")
    data = response.json()
    print(f"  Found: {len(data.get('contractors', []))} contractors")
    if data.get('contractors'):
        print(f"  Sample: {data['contractors'][0]['name']}")
except Exception as e:
    print(f"\n✗ Contractors Failed: {e}")

# Test complaints endpoint
try:
    response = requests.get('http://localhost:8000/api/complaints')
    print(f"\n✓ Complaints: {response.status_code}")
    data = response.json()
    print(f"  Found: {len(data.get('complaints', []))} complaints")
except Exception as e:
    print(f"\n✗ Complaints Failed: {e}")

# Test roads endpoint
try:
    response = requests.get('http://localhost:8000/api/roads')
    print(f"\n✓ Roads: {response.status_code}")
    data = response.json()
    print(f"  Found: {len(data.get('roads', []))} roads")
except Exception as e:
    print(f"\n✗ Roads Failed: {e}")

print("\n" + "=" * 50)
print("Testing complete!")
