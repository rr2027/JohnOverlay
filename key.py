import requests
import time

# Your API key and UUID
api_key = "5c2952ba-0184-4d83-82bd-775c8cce42b5"
uuid = "3b76b69a-e513-4296-a730-ed49171ad6f8"

# URL template with placeholders for API key and UUID
url_template = "https://api.hypixel.net/player?key={}&uuid={}"

# Number of requests you want to make
num_requests = 300

# Delay between requests in seconds
delay_between_requests = 0  # 60 seconds (1 minute)

for _ in range(num_requests):
    url = url_template.format(api_key, uuid)
    
    # Make a GET request to the URL
    response = requests.get(url)
    
    # Check if the "RateLimit-Remaining" header is present in the response
    if "RateLimit-Remaining" in response.headers:
        rate_john = int(response.headers["RateLimit-Reset"])
        rate_limit_limit = int(response.headers["RateLimit-Remaining"])
        print(f"Rate limit for this API key: {rate_limit_limit} requests per minute")
        print(f"key resets in {rate_john} seconds")
    else:
        print("Rate limit header not found in the response")
    
    # Wait for the specified delay before making the next request
    time.sleep(delay_between_requests)
