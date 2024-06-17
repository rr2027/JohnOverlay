const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
let counter = 0
let processedUuids = new Set();

const baseUrl = 'https://api.sk1er.club/friends/';

// Process a single UUID and return friends' UUIDs
async function fetchFriends(uuid, client) {
  if (processedUuids.has(uuid)) {
    return []; // Skip if already processed
  }

  processedUuids.add(uuid);
  let friendUuids = [];

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    };

    const response = await fetch(`${baseUrl}${uuid}`, { headers });
    const data = await response.json();

    if (!data) {
      return friendUuids;
    }

    const database = client.db('FriendsV2');
    const collection = database.collection('data');
    const existingEntry = await collection.findOne({ uuid });
    if (!existingEntry) {
      await collection.updateOne({ uuid }, { $set: { data } }, { upsert: true });  
     

    }


    for (const friendUuid in data) {
      if (data.hasOwnProperty(friendUuid)) {
        friendUuids.push(friendUuid);
      }
    }
  } catch (error) {
    console.error(`Error fetching data for UUID ${uuid}:`, error);
  }

  return friendUuids;
}

// Process multiple UUIDs concurrently
async function fetchFriendsConcurrently(uuids, client, batchSize = 10) {
  for (let i = 0; i < uuids.length; i += batchSize) {
    const batch = uuids.slice(i, i + batchSize);
    const allFriendUuids = await Promise.all(batch.map(uuid => fetchFriends(uuid, client)));
    const uniqueFriendUuids = [].concat(...allFriendUuids).filter(uuid => !processedUuids.has(uuid));
    if (uniqueFriendUuids.length > 0) {
      await fetchFriendsConcurrently(uniqueFriendUuids, client, batchSize);
    }
  }
}


async function saveFriendsData() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  startTime = Date.now(); // Record start time



  try {
    await client.connect();
    const uuids = ['Cory']; // Starting UUID
    await fetchFriendsConcurrently(uuids, client);
    counter = counter + 1
    console.log(counter)
    console.log('Friends data saved to MongoDB');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

saveFriendsData();
