import requests

url = 'https://api.antisniper.net/v2/player/chat?key=9ef7ff59-e9ee-4f50-8998-4e6130122845&player=Grapail'

response = requests.get(url)

data = response.json()

x = data["data"]

for john in x:
    if "ducky" in john["message"].lower():
        print(john["message"])



