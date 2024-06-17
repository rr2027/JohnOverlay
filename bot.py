import requests
import time

# Your Discord bot token
bot_token = "YOUR_BOT_TOKEN"
dog = 1
# The channel ID where the message will be sent
channel_id = "YOUR_CHANNEL_ID"

# Your API details
url = "https://api.antisniper.net/v2/other/online"
headers = {
    'Apikey': 'YOUR_API_KEY',
    'Reason': 'John'
}
data = {
    'players': ['maxwinyogi', 'Andorite', 'Ducky', 'ChildLine']
}

# Function to send a message and return its ID
def send_message(content):
    url = f"https://discord.com/api/channels/{channel_id}/messages"
    headers = {
        "Authorization": f"Bot {bot_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "content": content
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json().get("id")

# Function to edit a message
def edit_message(message_id, content):
    url = f"https://discord.com/api/channels/{channel_id}/messages/{message_id}"
    headers = {
        "Authorization": f"Bot {bot_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "content": content
    }
    requests.patch(url, json=payload, headers=headers)

# Initial message to get the message ID
message_id = send_message("Initial status update")
time.sleep(10)  # Wait before the first update

while True:
    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 200:
        api_data = response.json()
        player_data = api_data.get('data', [])

        if player_data:
            messages = []
            current_timestamp = int(time.time())

            for player in player_data:
                if player.get('online_in_last_10_minutes', False):
                    ign = player.get('ign', '')
                    message = f"`{ign}` - <t:{current_timestamp}:R>"
                    messages.append(message)
            
            if messages:
                combined_message = '\n'.join(messages)
                edit_message(message_id, combined_message)
            else:
                edit_message(message_id, "No players are currently online.")
        else:
            edit_message(message_id, "No player data found in the API response.")
    else:
        edit_message(message_id, f"Request to API failed with status code: {response.status_code}")

    # Wait for 10 minutes before the next update
    time.sleep(1)
