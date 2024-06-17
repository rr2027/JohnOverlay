import re
import string
import asyncio
import aiohttp
from twilio.rest import Client

# Twilio credentials
account_sid = 'your_account_sid'
auth_token = 'your_auth_token'
twilio_number = 'your_twilio_number'
recipient_number = 'your_recipient_number'

async def fetch_minecraft_profile(session, word):
    url = f"https://playerdb.co/api/player/minecraft/{word}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                return word  # Return the word if it's a valid Minecraft profile
            else:
                print(f"Error fetching profile for {word}: {response.status}")
                return None
    except aiohttp.ClientError as e:
        print(f"Error fetching profile for {word}: {e}")
        return None

async def get_minecraft_profiles(words):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_minecraft_profile(session, word) for word in words]
        valid_profiles = await asyncio.gather(*tasks)
        return [profile for profile in valid_profiles if profile is not None]

def remove_short_words_and_comments(input_file, output_file):
    while True:
        with open(input_file, 'r') as file:
            lines = file.readlines()

        # Get all words from lines
        words = []
        for line in lines:
            # Remove lines containing '#'
            if '#' in line:
                continue
            # Remove non-English characters
            line = re.sub(r'[^\x00-\x7F]+', ' ', line)
            # Remove punctuation from the line
            line = line.translate(str.maketrans('', '', string.punctuation))
            # Remove numbers
            line = re.sub(r'\d+', '', line)
            # Split the line into words and add them to the list of words
            words.extend(line.split())

        # Get Minecraft profiles for all words
        valid_profiles = asyncio.run(get_minecraft_profiles(words))

        # Write the filtered content back to the file
        with open(output_file, 'w') as file:
            for word in valid_profiles:
                file.write(f"{word}\n")

        if not valid_profiles:
            # Send text message if no valid profiles were found
            send_text_message("No valid Minecraft profiles found")

def send_text_message(message):
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=message,
        from_=twilio_number,
        to=recipient_number
    )
    print("Text message sent:", message.sid)

if __name__ == "__main__":
    input_file = input("Enter the input file name: ")
    output_file = input("Enter the output file name: ")
    remove_short_words_and_comments(input_file, output_file)
