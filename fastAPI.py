from fastapi import FastAPI, HTTPException, Query, Path
from pymongo import MongoClient
import requests

app = FastAPI()

# Connect to your MongoDB database
client = MongoClient("mongodb://localhost:27017/")
db = client["rawgames"]
collection = db["friends"]

# PlayerDB API endpoint
PLAYERDB_API_URL = "https://playerdb.co/api/player/minecraft/name"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15"
}
# Sk1er API endpoint

@app.get("/friends/{id}")
async def get_friends(id: str = Path(..., title="Minecraft username or UUID")):
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
        # Transform the data to only include the time property for each friend
        transformed_data = {
            friend_uuid: {"time": friend_data["time"]}
            for friend_uuid, friend_data in item["data"].items()
        }
        # If the player exists in the database, return the transformed data
        return transformed_data
    else:
        # If the player does not exist in the database, return an error response
        return {"success": False, "cause": "Player not found"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
