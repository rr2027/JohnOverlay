from fastapi import FastAPI, HTTPException, Query, Path
from pymongo import MongoClient
import requests

app = FastAPI()

# Connect to your MongoDB database
client = MongoClient("mongodb://localhost:27017/")
db = client["FriendsV2"]
collection = db["data"]

# PlayerDB API endpoint
PLAYERDB_API_URL = "https://playerdb.co/api/player/minecraft/name"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15"
}
# Sk1er API endpoint
SK1ER_API_URL = "https://api.sk1er.club/friends/{id}"

@app.get("/player/{id}")
async def get_item(id: str = Path(..., title="Minecraft username or UUID")):
    # Use the PlayerDB API to get the player's UUID from the username
    playerdb_response = requests.get(f"{PLAYERDB_API_URL}/{id}", headers=headers)
    playerdb_data = playerdb_response.json()

    if playerdb_data.get("success"):
        raw_id = playerdb_data["data"]["player"]["raw_id"]
    else:
        # If the PlayerDB API request fails, return an error response
        return {"success": False, "cause": "Player not found"}

    # Query MongoDB to retrieve data using the "raw_id" field
    item = collection.find_one({"uuid": raw_id})

    if item:
        # If the player exists in the database, return the stored data
        return item["data"]
    else:
        # If the player is not found in the database, make an API request to Sk1er API
        sk1er_response = requests.get(SK1ER_API_URL.format(id=raw_id), headers=headers)
        sk1er_data = sk1er_response.json()

        if sk1er_response.status_code == 200:
            # Save the friends data to the database with the raw_id
            collection.insert_one({"uuid": raw_id, "data": sk1er_data["friends"]})

            # Return the friends data
            return sk1er_data["friends"]
        else:
            # If the Sk1er API request fails, return an error response
            return {"success": False, "cause": "Player not found"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
