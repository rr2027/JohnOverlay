const fetch = require('node-fetch');

async function createPlayerGuildDictionary(playerName) {
  const url = `https://api.sk1er.club/guild/player/${playerName}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36'
  };
  
  try {
    const response = await fetch(url, { headers }); // Pass the headers in the options

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status code: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.guild && data.guild.members) {
      const guildMembers = data.guild.members;
      const playerGuildDictionary = {};

      guildMembers.forEach(member => {
        const memberName = member.name;
        const joinedEpochTime = member.joined;

        if (!playerGuildDictionary[playerName]) {
          playerGuildDictionary[playerName] = [];
        }

        playerGuildDictionary[playerName].push({
          name: memberName,
          joined: joinedEpochTime
        });
      });

      return playerGuildDictionary;
    } else {
      throw new Error("Invalid or missing data in the response.");
    }
  } catch (error) {
    console.error(`Error fetching guild data for ${playerName}: ${error.message}`);
    return {}; // Return an empty dictionary in case of an error
  }
}

async function fetchData(playerName) {
    const playerGuildDictionary = await createPlayerGuildDictionary(playerName);
    console.log(playerGuildDictionary);
  }
// Example usage:
fetchData("Ducky");
;
