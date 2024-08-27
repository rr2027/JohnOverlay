import requests
import time

# Define the API endpoint and the parameters
url = "https://api.antisniper.net/v2/player/checks"
params = {
    "key": "9ef7ff59-e9ee-4f50-8998-4e6130122845",
    "player": "CatLocks"
}

# Send the request to the API
response = requests.get(url, params=params)

# Initialize variables
old_shop = None
old_time = None

# Check if the response status code is OK
if response.status_code == 200:
    data = response.json()
    checks = data.get("data", [])
    
    for check in checks:
        shop = check.get("shop")
        timestamp = check.get("timestamp")

        if old_shop is not None and shop != old_shop:
            if old_time is None or timestamp > old_time:
                old_time = timestamp
        old_john = old_shop
        old_shop = shop

    print(old_time)    
    print(shop)
    print(old_john)
else:
    print("Failed to retrieve data:", response.status_code)