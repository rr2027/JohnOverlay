import pymongo
import mysql.connector
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["rawgames"]
mongo_collection = mongo_db["friends"]

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
    CREATE TABLE IF NOT EXISTS player_friends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_uuid VARCHAR(255),
        friend_uuid VARCHAR(255),
        friend_time BIGINT
    )
""")

# Extract data from MongoDB and insert into MySQL
document_count = 0
for document in mongo_collection.find():
    player_uuid = document["uuid"]
    if document.get("data") is not None:  # Ensure "data" is not None
        for friend_uuid, friend_data in document["data"].items():
            # Ensure friend_data is a dictionary
            if isinstance(friend_data, dict):
                friend_time = int(friend_data.get("time", 0))  # Convert to int if "time" is not found
                
                # Insert data into MySQL
                sql_cursor.execute("""
                    INSERT INTO player_friends (player_uuid, friend_uuid, friend_time)
                    VALUES (%s, %s, %s)
                """, (player_uuid, friend_uuid, friend_time))
    
    # Increment the document count for each MongoDB document processed
    document_count += 1
    if document_count % 100 == 0:
        logging.info(f"{document_count} documents processed")

# Commit the transaction
sql_conn.commit()

# Close the connections
sql_cursor.close()
sql_conn.close()
mongo_client.close()

logging.info(f"Processing complete. Total documents processed: {document_count}")
