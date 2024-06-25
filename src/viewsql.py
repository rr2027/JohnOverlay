import pymongo
import mysql.connector

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["rawgames"]
mongo_collection = mongo_db["recentgames"]

# Connect to MySQL
sql_conn = mysql.connector.connect(
    host="localhost",
    user="yogi",
    password="Yogi1234",
    database="friends2"
)
sql_cursor = sql_conn.cursor()

# Create a table in MySQL (if not exists)
sql_cursor.execute("""
    CREATE TABLE IF NOT EXISTS recent_games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(255),
        date BIGINT,
        gameType VARCHAR(50),
        mode VARCHAR(50),
        map VARCHAR(50),
        ended BIGINT
    )
""")

# Extract data from MongoDB and insert into MySQL
for document in mongo_collection.find():
    uuid = document["uuid"]
    for game in document["recentGames"]:
        date = game["date"]
        gameType = game["gameType"]
        mode = game.get("mode", None)  # Handle null values
        map_name = game["map"]
        ended = game["ended"]
        
        # Insert data into MySQL
        sql_cursor.execute("""
            INSERT INTO recent_games (uuid, date, gameType, mode, map, ended)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (uuid, date, gameType, mode, map_name, ended))

# Commit the transaction
sql_conn.commit()

# Close the connections
sql_cursor.close()
sql_conn.close()
mongo_client.close()

print("Data migration completed.")
