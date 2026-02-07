
import urllib.request
import json

url = "http://127.0.0.1:8000/api/auth/register"
payload = {
    "username": "urllib_user",
    "email": "urllib@example.com",
    "password": "strongpassword123",
    "role": "student"
}
data = json.dumps(payload).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req) as f:
        print(f"Status Code: {f.status}")
        print(f"Response Body: {f.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Error Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
