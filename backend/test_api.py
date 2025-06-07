import requests
import json

def test_api():

    response = requests.get("http://localhost:8000/")
    print("Root endpoint response:", response.json())
    

    test_url = "https://example.com"
    response = requests.post(
        "http://localhost:8000/api/v1/clone",
        json={"url": test_url}
    )
    print("\nClone endpoint response status:", response.status_code)
    if response.status_code == 200:
        print("Response content:", response.json())
    else:
        print("Error:", response.text)

if __name__ == "__main__":
    test_api() 