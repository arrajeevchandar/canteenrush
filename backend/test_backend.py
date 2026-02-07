
import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_backend():
    print("Testing backend health...")
    try:
        # 1. Health check (root)
        resp = requests.get("http://127.0.0.1:8000/")
        print(f"Root: {resp.status_code} {resp.json()}")

        # 2. Register User
        email = "testvendor@example.com"
        username = "testvendor"
        password = "password123"
        print(f"Registering {email}...")
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "username": username,
            "password": password,
            "role": "vendor"
        })
        if resp.status_code == 200:
            print("Registration success")
        elif resp.status_code == 400 and "already registered" in resp.text:
            print("User already registered")
        else:
            print(f"Registration failed: {resp.status_code} {resp.text}")
            return

        # 3. Login
        print("Logging in...")
        resp = requests.post(f"{BASE_URL}/auth/token", data={
            "username": email,
            "password": password
        })
        if resp.status_code != 200:
             print(f"Login failed: {resp.status_code} {resp.text}")
             return
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login success")

        # 4. Create Menu Item
        print("Creating menu item...")
        item_data = {
            "name": "Test Burger",
            "price": 50,
            "description": "Tasty",
            "prep_time_estimate": 10,
            "image_url": "http://example.com/burger.jpg"
        }
        resp = requests.post(f"{BASE_URL}/menu/", json=item_data, headers=headers)
        if resp.status_code == 200:
            print(f"Create item success: {resp.json()}")
        else:
            print(f"Create item failed: {resp.status_code} {resp.text}")
            return
            
        # 5. Get Menu
        print("Fetching menu...")
        resp = requests.get(f"{BASE_URL}/menu/")
        print(f"Menu: {resp.json()}")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_backend()
