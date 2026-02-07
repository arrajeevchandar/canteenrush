
import requests
import json

url = "http://127.0.0.1:8000/api/auth/register"
payload = {
    "username": "debug_user",
    "email": "debug@example.com",
    "password": "strongpassword123",
    "role": "student"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
