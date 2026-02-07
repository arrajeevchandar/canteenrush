import requests
import json
import random
import string

API_URL = "http://127.0.0.1:8000/api"

def random_string(length=5):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_menu_flow():
    # 1. Register Vendor
    vendor_username = f"vendor_{random_string()}"
    vendor_email = f"{vendor_username}@example.com"
    password = "password"
    
    print(f"Registering Vendor: {vendor_username}...")
    requests.post(f"{API_URL}/auth/register", json={
        "username": vendor_username, "email": vendor_email, "password": password, "role": "vendor"
    })
    
    # 2. Login Vendor
    print("Logging in Vendor...")
    res = requests.post(f"{API_URL}/auth/token", data={"username": vendor_username, "password": password})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create Menu Item
    print("Creating Menu Item...")
    item_payload = {
        "name": f"Special Burger {random_string()}",
        "price": 12.5,
        "description": "Delicious vendor burger",
        "prep_time_estimate": 15
    }
    res = requests.post(f"{API_URL}/menu/", json=item_payload, headers=headers)
    if res.status_code != 200:
        print(f"❌ Failed to create item: {res.text}")
        return
    print("✅ Item Created")

    # 4. Fetch Menu as Student (or public)
    print("Fetching Menu...")
    res = requests.get(f"{API_URL}/menu/")
    items = res.json()
    
    # 5. Verify Vendor Name
    found = False
    for item in items:
        if item["name"] == item_payload["name"]:
            print(f"Found Item: {item['name']}")
            print(f"Vendor Name: {item.get('vendor_name')}")
            if item.get("vendor_name") == vendor_username:
                print("✅ Vendor Name Match")
                found = True
            else:
                print(f"❌ Vendor Name Mismatch: {item.get('vendor_name')} vs {vendor_username}")
            break
            
    if not found:
        print("❌ Item not found in menu")

if __name__ == "__main__":
    test_menu_flow()
