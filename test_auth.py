import requests
import json
import random
import string

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

API_URL = "http://127.0.0.1:8000/api"

def test_registration():
    username = f"user_{random_string(5)}"
    email = f"{username}@example.com"
    password = "securepassword"
    role = "student"

    payload = {
        "username": username,
        "email": email,
        "password": password,
        "role": role
    }

    try:
        print(f"Attempting to register user: {username}")
        response = requests.post(f"{API_URL}/auth/register", json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Registration SUCCESS")
            return True, username, password
        else:
            print("❌ Registration FAILED")
            return False, None, None

    except Exception as e:
        print(f"❌ Exception: {e}")
        return False, None, None

def test_login(username, password):
    payload = {
        "username": username,
        "password": password
    }
    
    try:
        print(f"Attempting to login user: {username}")
        response = requests.post(f"{API_URL}/auth/token", data=payload) # OAuth2 form data
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login SUCCESS")
            print(f"Token received: {response.json().get('access_token')[:20]}...")
        else:
            print("❌ Login FAILED")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    success, username, password = test_registration()
    if success:
        test_login(username, password)
