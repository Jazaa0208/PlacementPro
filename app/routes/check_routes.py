import requests
import sys

def check_routes():
    """Check all available routes on the backend"""
    
    base_url = "http://localhost:5000"
    
    # Check if backend is running
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Backend not running: {e}")
        print("Start backend with: python run.py")
        return
    
    # Check all possible endpoints
    endpoints = [
        "/api/health",
        "/api/parse-resume",
        "/api/analyze-job-match",
        "/api/auth/login",
        "/api/test",
        "/api/aptitude",
        "/api/coding",
        "/api/baseline"
    ]
    
    print("\n📋 Checking endpoints:")
    print("-" * 50)
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            response = requests.get(url, timeout=3)
            print(f"{url:45} {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"{url:45} ERROR - {str(e)[:50]}")
    
    # Try OPTIONS request for POST endpoints
    print("\n📋 Checking OPTIONS for POST endpoints:")
    print("-" * 50)
    
    post_endpoints = [
        "/api/parse-resume",
        "/api/analyze-job-match",
        "/api/auth/login"
    ]
    
    for endpoint in post_endpoints:
        url = f"{base_url}{endpoint}"
        try:
            response = requests.options(url, timeout=3)
            print(f"{url:45} OPTIONS {response.status_code}")
            if response.status_code == 200:
                print(f"    Headers: {dict(response.headers)}")
        except Exception as e:
            print(f"{url:45} OPTIONS ERROR - {str(e)[:50]}")

if __name__ == "__main__":
    check_routes()import requests
import sys

def check_routes():
    """Check all available routes on the backend"""
    
    base_url = "http://localhost:5000"
    
    # Check if backend is running
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Backend not running: {e}")
        print("Start backend with: python run.py")
        return
    
    # Check all possible endpoints
    endpoints = [
        "/api/health",
        "/api/parse-resume",
        "/api/analyze-job-match",
        "/api/auth/login",
        "/api/test",
        "/api/aptitude",
        "/api/coding",
        "/api/baseline"
    ]
    
    print("\n📋 Checking endpoints:")
    print("-" * 50)
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            response = requests.get(url, timeout=3)
            print(f"{url:45} {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"{url:45} ERROR - {str(e)[:50]}")
    
    # Try OPTIONS request for POST endpoints
    print("\n📋 Checking OPTIONS for POST endpoints:")
    print("-" * 50)
    
    post_endpoints = [
        "/api/parse-resume",
        "/api/analyze-job-match",
        "/api/auth/login"
    ]
    
    for endpoint in post_endpoints:
        url = f"{base_url}{endpoint}"
        try:
            response = requests.options(url, timeout=3)
            print(f"{url:45} OPTIONS {response.status_code}")
            if response.status_code == 200:
                print(f"    Headers: {dict(response.headers)}")
        except Exception as e:
            print(f"{url:45} OPTIONS ERROR - {str(e)[:50]}")

if __name__ == "__main__":
    check_routes()