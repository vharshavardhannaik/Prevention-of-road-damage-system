"""
QR Code System Test Script
Tests all QR code functionality for contractors
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")

def test_generate_all_qr():
    """Test generating QR codes for all contractors"""
    print_section("TEST 1: Generate QR Codes for All Contractors")
    
    try:
        response = requests.post(f"{BASE_URL}/contractors/generate-all-qr")
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            print(f"✅ SUCCESS: Generated QR codes for {data['generated']} contractors")
        else:
            print(f"❌ FAILED: {data}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_get_contractor_qr(contractor_id="CONT-001"):
    """Test getting QR code for specific contractor"""
    print_section(f"TEST 2: Get QR Code for Contractor {contractor_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/contractors/{contractor_id}/qr")
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Contractor ID: {data.get('contractorId')}")
        print(f"Contractor Name: {data.get('name')}")
        print(f"QR URL: {data.get('qrUrl')}")
        print(f"QR Code: {'Present' if data.get('qrCode') else 'Missing'}")
        print(f"QR Code Length: {len(data.get('qrCode', ''))} characters")
        
        if response.status_code == 200 and data.get('qrCode'):
            print("✅ SUCCESS: QR code retrieved")
        else:
            print(f"❌ FAILED: {data}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_get_public_contractor_info(contractor_id="CONT-001"):
    """Test getting public contractor information"""
    print_section(f"TEST 3: Get Public Info for Contractor {contractor_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/public/contractor/{contractor_id}")
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Public info retrieved")
        else:
            print(f"❌ FAILED: {data}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_submit_public_rating(contractor_id="CONT-001"):
    """Test submitting a public rating"""
    print_section(f"TEST 4: Submit Public Rating for Contractor {contractor_id}")
    
    payload = {
        "ratingValue": 5,
        "comment": "Excellent work! Road is smooth and well-constructed."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/public/contractor/{contractor_id}/rating",
            json=payload
        )
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code in [200, 201]:
            print("✅ SUCCESS: Rating submitted")
        else:
            print(f"❌ FAILED: {data}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_submit_public_complaint(contractor_id="CONT-001"):
    """Test submitting a public complaint"""
    print_section(f"TEST 5: Submit Public Complaint for Contractor {contractor_id}")
    
    payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "complaintText": "Small crack observed on the road surface",
        "severity": "Low"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/public/contractor/{contractor_id}/complaint",
            json=payload
        )
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code in [200, 201]:
            print("✅ SUCCESS: Complaint submitted")
        else:
            print(f"❌ FAILED: {data}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_get_all_contractors():
    """Test getting all contractors with QR status"""
    print_section("TEST 6: Get All Contractors with QR Status")
    
    try:
        response = requests.get(f"{BASE_URL}/contractors")
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Total Contractors: {data.get('count', 0)}")
        print("\nContractor List:")
        print("-" * 80)
        
        for contractor in data.get('contractors', []):
            qr_status = "✅ Has QR" if contractor.get('hasQRCode') else "❌ No QR"
            print(f"  {contractor.get('name'):30} | Rating: {contractor.get('currentRating')}/5.0 | {qr_status}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS: Retrieved all contractors")
        else:
            print(f"\n❌ FAILED: {data}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def run_all_tests():
    """Run all tests"""
    print("\n" + "🎯" * 30)
    print("   QR CODE SYSTEM - COMPREHENSIVE TEST SUITE")
    print("🎯" * 30)
    
    # Test 1: Generate QR codes for all contractors
    test_generate_all_qr()
    
    # Test 2: Get QR code for specific contractor
    test_get_contractor_qr("CONT-001")
    
    # Test 3: Get public contractor info
    test_get_public_contractor_info("CONT-001")
    
    # Test 4: Submit public rating
    test_submit_public_rating("CONT-001")
    
    # Test 5: Submit public complaint
    test_submit_public_complaint("CONT-001")
    
    # Test 6: Get all contractors with QR status
    test_get_all_contractors()
    
    print_section("TEST SUITE COMPLETE")
    print("✅ All tests executed")
    print("\nNext Steps:")
    print("1. Open http://localhost:3000/admin/dashboard")
    print("2. Navigate to Contractors tab")
    print("3. Click 'Generate QR Codes for All Contractors'")
    print("4. Click 'View QR' on any contractor")
    print("5. Download and test the QR code")
    print("6. Scan QR code with your phone to test feedback page")
    print("\n" + "🎯" * 30 + "\n")

if __name__ == "__main__":
    print("\n⚠️  IMPORTANT: Make sure the backend server is running!")
    print("    Run: cd backend_django && python manage.py runserver\n")
    
    input("Press Enter to start tests...")
    run_all_tests()
