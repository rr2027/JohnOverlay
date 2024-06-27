import axios, { all } from "axios";
import axiosRetry from "axios-retry";
const fetch = require('node-fetch');
const { GlobalKeyboardListener } = require('node-global-key-listener');
import { useIpcRenderer } from "@vueuse/electron";
export const excludedPlayersString = dataStore.get('excludedPlayers');
export const excludedPlayers = excludedPlayersString.split(',').map(player => player.trim());
const fs = require('fs/promises');
const toggleKey = dataStore.get("toggleKey");

var players = [];
var who = [];
var playersInQueue = [];
var playersInParty = [];
export let safelistedPlayers = [];
var cachedPlayers = {};
var johnPlayers = {}
export let playerRecentgamesDictionaries = {};
export let queueDictionaries = {};
export let blacklistedDict = {}

export let safelistedDict = {};
let playeruuidDict = {};
export let playerProfileDictionaries = {}
export let legacyQueuesDictionaries = {}
export let playerFriendsDictionaries = {};
export let playerNCDictionary = {};

export let playerGuildDictionary = {}
export let persistentPlayerEncounters = {};
export let playerLanguages = {};
export let questCompletionTimes = {};
export let playerChecksDictionary = {};
export let playerSlumberTickets = {};
export let playerChannel = {};
export let playerBridgingTimes = {}
export let playerActiveChallenges = {}
export let safelistJson = {}
export let playerDataDictionary = {}
export let ipDictionary = {}

var windowIsHidden = false

const APIKEY = "084ec062-a4da-4ec2-90da-5e1c8545a2f8"


const listener = new GlobalKeyboardListener();
listener.addListener((e) => {
  if (e.state === 'DOWN') { // Key down event

    if (e.name === toggleKey) {
      if (windowIsHidden) {
        ipcRenderer.send("windowEvent", "show");
      } else {
        ipcRenderer.send("windowEvent", "hide");
      }
      windowIsHidden = !windowIsHidden; // Toggle the window state
    }
  }
});








import dataStore from "../data/dataStore";
import { sendNotification } from "./snackbarNotification";

const ipcRenderer = useIpcRenderer();
if (windowIsHidden) {
  ipcRenderer.send("windowEvent", "hide");
}
async function getPlayerBlacklist(player, uuid) {
  const apiUrl = `https://johnify.xyz/getblacklist?key=John&uuid=${uuid}`
  try {
    const response = await(fetch(apiUrl));
    if(!response.ok){
    }
    const data = await response.json();
    if(response.ok){
    blacklistedDict[player] = data["data"]
    }
  }catch (error) {
    console.log(error)


}
}
async function getPlayerSafelist(player, uuid) {
  const apiUrl = `https://johnify.xyz/getsafelist?key=John&uuid=${uuid}`
  try {
    const response = await(fetch(apiUrl));
    if(!response.ok){
    }
    const data = await response.json();
    if(response.ok){
    safelistedDict[player] = data["data"]
    }
    // console.log("safelist dictionary", safelistedDict)
}catch (error) {
  // console.error('error with safelist', error);
}
}
async function getPugData(uuid, playerName) {
  const apiUrl = `https://privatemethod.xyz/api/cubelify?key=305ddf33-79e2-48c6-b5c8-ecd9db11d9b9&id=${uuid}&name=${playerName}&sources=GAME&encounters=false`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.207 Safari/537.36'
  };

  try {
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const tagsDictionary = data.tags.reduce((acc, tag, index) => {
      acc[index] = {
        text: tag.text || '',
        textColor: tag.textColor,
        tooltip: tag.tooltip,
        icon: tag.icon,
        color: tag.color
      };
      return acc;
    }, {});

    playerDataDictionary[playerName] = {
      ...(playerDataDictionary[playerName] || {}),
      ...tagsDictionary
    };
    // console.log('playerDataDictionary:', playerDataDictionary);
    return playerDataDictionary;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
const keysXD = [
"BqHbd4e26vuZrOzRU0P8UGk1on3RrVAW",
"V05oA1cSLbL5C03s2NBNhy5ja311brmz",
"YPZ7NqiZi8IXG4USDEgQlUxIj2K3m1xH",
"2lICnEdwO33FZbiomivUh9OeBZwXAvaK",
"gpZcVRSMo7Cpw8CLegg3jlsnlhnghQ2M",
"qC4G2RlVHibFTzOTeBY3EZOGaymAP3t9",
"oJWKoGzJV0Id6hXDtNxqhdlSBli8aEjy"
]

async function getPlayerIps(uuid, apiKeys) {
  const apiUrl = "https://api.serverseeker.net/whereis";
  
  // Cycle through API keys using modulus operator to avoid going out of bounds
  const apiKey = apiKeys[Math.floor(Math.random() * keysXD.length)];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ uuid: uuid })
  });

  if (!response.ok) {
    const errorMessage = await response.text();  // Read the response body for error details
    throw new Error('Network response was not ok: ' + errorMessage);
  }

  const responseData = await response.json();
  return responseData.data; // Return the nested data array
}



// Example usage:



async function getPlayerQueueData(playerName) {
  const apiUrl = `https://api.antisniper.net/v2/player/queues?key=${APIKEY}&player=${playerName}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      const playerData = {
        [playerName]: {
          queue: [],
        },
      };

      for (const queueItem of data.data) {
        for (const item of queueItem.queue) {
          playerData[playerName].queue.push(item.uuid);
        }
      }

      queueDictionaries[playerName] = playerData[playerName];

      // console.log("Updated queue dictionary", queueDictionaries[playerName])
      return playerData;
    } else {
      throw new Error(`API request was not successful: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${playerName}: ${error.message}`);
    return {};
  }
}



let lastUsedKeyIndex = 0;

async function fetchSkyblockProfiles(uuid) {
  const apiKeys = [
    '',

  ];

  const apiKey = apiKeys[lastUsedKeyIndex];
  lastUsedKeyIndex = (lastUsedKeyIndex + 1) % apiKeys.length;

  const apiUrl = `https://api.hypixel.net/v2/skyblock/profiles?key=06c43cf8-bf39-450f-88b2-e3f8f13fe85b&uuid=${uuid}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(`Error fetching profiles for UUID ${uuid} with API key ${apiKey}: ${error.message}`);
    return { profiles: [] };
  }
}
async function createPlayerGuildDictionary(playerName) {
  const url = `https://api.sk1er.club/guild/player/${playerName}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36'
  };

  try {
    const response = await fetch(url, { headers });

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
      playerGuildDictionary[playerName] = {};
      return playerGuildDictionary;
    }
  } catch (error) {
    console.error(`Error fetching guild data for ${playerName}: ${error.message}`);
    playerGuildDictionary[playerName] = {};
    return playerGuildDictionary;
  }
}

async function fetchData(playerName) {
  const newPlayerGuildData = await createPlayerGuildDictionary(playerName);

  const updatedPlayerGuildDictionary = {
    ...playerGuildDictionary,
    ...newPlayerGuildData,
  };

  playerGuildDictionary = updatedPlayerGuildDictionary;

  // console.log("Updated guild dictionary:", playerGuildDictionary);
}

async function createPlayerProfileDictionary(uuid, playerName) {

  try {
    const profilesData = await fetchSkyblockProfiles(uuid);

    const playerDictionary = {
      ign: playerName,
      members: {}
    };

    profilesData.profiles.forEach(profile => {
      const profileMembers = profile.members;
      for (const memberUUID in profileMembers) {
        if (profileMembers.hasOwnProperty(memberUUID)) {
          playerDictionary.members[memberUUID] = {
            first_join: profileMembers[memberUUID].profile.first_join
          };
        }
      }
    });

    playerProfileDictionaries[playerName] = playerDictionary;
    // console.log(playerProfileDictionaries)

  } catch (error) {
    // console.error(`Error fetching profiles for ${playerName}: ${error.message}`);
    playerProfileDictionaries[playerName] = {
      ign: playerName,
      members: {}
    };
  }
}

async function createPlayerChecksDictionary(playerName) {
  const url = `https://api.antisniper.net/v2/player/checks?player=${playerName}&key=9ef7ff59-e9ee-4f50-8998-4e6130122845`;

  const headers = {
    'User-Agent': 'Apple Gecko',
  };
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data.length > 0) {
      const timestamps = data.data.map(entry => entry.timestamp);
      playerChecksDictionary[playerName] = {
        playerName, // equivalent to playerName: playerName
        data
      };

      return timestamps; // Returning timestamps if needed elsewhere
    } else {
      throw new Error(`API request was not successful: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching player checks for ${playerName}: ${error.message}`);
    return []; // Return an empty array in case of error
  }
}



// async function loadSafelistJson() {
//   try {
//     const data = await fs.readFile(path, 'utf8');
//     safelistJson = JSON.parse(data);
//     // console.log('Safelist JSON reloaded successfully.');
//     // console.log(safelistJson)
//   } catch (error) {
//     console.error('Failed to reload safelist JSON:', error);
//   }
// }

async function createLegacyQueuesDictionary(uuid, playerName) {
  const apiUrl = `https://api.antisniper.net/v2/player/queues/legacy?key=${APIKEY}&player=${uuid}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      const tablistEntries = [];
      // console.log(data);

      for (const entry of data.data) {
        for (const playerName in entry.tablist) {
          if (entry.tablist.hasOwnProperty(playerName)) {
            const tablistEntry = entry.tablist[playerName];
            if (typeof tablistEntry === 'string') {
              const uuid = tablistEntry.replace(/[^a-f0-9]/ig, '');
              const timestamp = entry.current_time; // Get the current_time from the entry
              tablistEntries.push({ uuid, timestamp });
            }
          }
        }
      }

      const ign = playerName;
      legacyQueuesDictionaries[playerName] = {
        ign,  // equivalent to ign: ign
        tablistEntries  // Array of objects with uuid and timestamp
      };
      // console.log("Legacy Queue Dictionary", legacyQueuesDictionaries);

      return tablistEntries;
    } else {
      throw new Error(`API request was not successful: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching legacy queues for ${playerName}: ${error.message}`);
    return [];
  }
}


async function updatePlayerLanguage(uuid, playerName) {
  const apiUrl = `https://api.hypixel.net/player?key=fd1101bd-7e5c-4057-8985-0316fd5b8237&uuid=${uuid}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // console.log(data)
    if (data.success && data.player) {
      // Extract the user language from the player data
      // console.log("SUCCESS")
      // const userLanguage = data.player.userLanguage || 'ENGLISH'; // Defaulting to 'ENGLISH' if not present
      // const userChannel = data.player.channel || "ALL"
      // const bridgingTime = data.player.stats.Bedwars.practice.records["bridging_distance_30:elevation_NONE:angle_STRAIGHT:"] || 0;
      // const activeChallenge = data.player.stats.Bedwars.selected_challenge_type || 'NONE'
      // console.log(playerLanguages)
      // Update the global dictionary with the player's name and their language



      // Initialize or update the player's quest completion times
      questCompletionTimes[playerName.toLowerCase()] = { times: [] }; // Initialize the times array

      // Loop through each quest and extract completion times
      const quests = data.player.quests || {};
      Object.values(quests).forEach(quest => {
        const completions = quest.completions || [];
        const completionTimes = completions.map(completion => completion.time);
        // Now we are sure questCompletionTimes[playerName.toLowerCase()] is an array, so we can safely use .push
        questCompletionTimes[playerName.toLowerCase()].times.push(...completionTimes);

      });

      // console.log(`Updated playerLanguages for ${playerName}:`, playerLanguages);
      // console.log(`Updated questCompletionTimes for ${playerName}:`, questCompletionTimes[playerName.toLowerCase()]);
      // console.log(`updated channel for ${playerName}`, playerChannel[playerName.toLowerCase()]);
      // console.log(`updated tickets for ${playerName}:`, playerSlumberTickets[playerName.toLowerCase()]);
      // console.log(`updated bridge times for ${playerName}:`, playerBridgingTimes[playerName.toLowerCase()]);
      // console.log(`updated challenge for ${playerName}:`, playerActiveChallenges[playerName.toLowerCase()]);

    } else {
      throw new Error(`API request was not successful or 'player' data is missing: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${playerName}: ${error.message}`);
  }
}



async function updatePlayerFriends(playerName) {
  const apiUrl = `https://api.antisniper.net/v2/namemc/archive?key=${APIKEY}&name=${playerName}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.following) {
      // Extract the names of the players being followed (friends)
      const friendsData = data.following.map(entry => entry.name);

      // Update the global dictionary with the player's name, IGN, and their friends
      playerNCDictionary[playerName] = {
        ign: playerName,
        friends: friendsData
      };

      // console.log(`Updated playerFriendsDictionaries for ${playerName}:`, playerFriendsDictionaries);
    } else {
      // throw new Error(`API request was not successful or 'following' data is missing: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching 'following' players for ${playerName}: ${error.message}`);
  }
}
async function fetchFriends(uuid) {
  const apiUrl = `http://johnify.xyz/friends?uuid=${uuid}&key=John`;
  try {
    const headers = {
      'User-Agent': 'Apple Gecko', // Set your custom User-Agent header here
    };
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching friends for ${playerName}: ${error.message}`);
    return { friends: [] }; // Return an empty array on error
  }
}
async function createPlayerFriendsDictionary(playerName, uuid) {
  try {
    const friendsData = await fetchFriends(uuid);

    if (friendsData && friendsData.success === false) {
      // Handle the case where fetching friends was not successful
    } else {
      // Transform the friends array to an object
      const transformedFriends = friendsData.friends.reduce((acc, friend) => {
        acc[friend.friend_uuid] = { time: friend.friend_time };
        return acc;
      }, {});

      // Update the global dictionary for this specific player
      playerFriendsDictionaries[playerName] = {
        ign: playerName,
        friends: transformedFriends
      };
      console.log(playerFriendsDictionaries);
    }

  } catch (error) {
    console.error(`Error fetching friends for ${playerName}:`, error.message);
    // In case of an error, ensure an empty structure for consistency
    playerFriendsDictionaries[playerName] = {
      ign: playerName,
      friends: {}
    };
  }
}



async function fetchRecentGames(uuid, playerName) {
  let normalizedPlayerUUID = uuid.replace(/-/g, '');
  const apiUrl = `http://johnify.xyz/recentgames?key=John&uuid=${normalizedPlayerUUID}}`;
  try {
    const headers = {
      'User-Agent': 'Apple Gecko',
    };
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(`Error fetching recentgames for ${playerName}: ${error.message}`);
    return { friends: [] };
  }
}
async function createRecentGamesDictionary(uuid, playerName) {
  try {
    const recentGamesData = await fetchRecentGames(uuid, playerName);

    if (recentGamesData && recentGamesData.success === false) {
      console.log("API request unsuccessful");
    } else {
      const dates = recentGamesData.recentGames.map(game => game.date);

      playerRecentgamesDictionaries[playerName] = {
        ign: playerName,
        recentGamesDates: dates // Only storing the dates
      };
      console.log(playerRecentgamesDictionaries);
    }

  } catch (error) {
    // console.error(`Error fetching recent games for ${playerName}:`, error.message);
    playerRecentgamesDictionaries[playerName] = {
      ign: playerName,
      recentGamesDates: [] // Setting an empty array if there's an error
    };
  }
}




const removeDuplicates = () => {
  playersInQueue = [...new Set(playersInQueue)];
  playersInParty = [...new Set(playersInParty)];
  players = [...new Map(players.map((player) => [player.username, player])).values()];
};

const axiosClient = axios.create();

axiosRetry(axiosClient, {
  retries: 10,
  retryDelay: (retryCount, error) => {
    if (error?.response?.headers?.["x-ratelimit-reset"]) return Number(error.response.headers["x-ratelimit-reset"]) * 1000;
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    if (error?.response?.status && error?.response?.headers?.["x-ratelimit-reset"]) {
      if (error.response.status === 429) {
        sendNotification({
          timeout: 5000,
          color: "warning",
          icon: "mdi-speedometer",
          text: `You are being ratelimited! You can requests further players in ${error.response.headers["x-ratelimit-reset"]} seconds!`,
        });
      }
      return error.response.status === 429 || error.response.status === 502 || error.response.status === 503 || error.response.status === 504;
    }
    return false;
  },
});

var inLobby = true;

const getRatio = (a, b) => {
  if (a === 0) {
    return 0;
  }
  if (b === 0) {
    return a;
  }
  return Number(a / b);
};
var keyCount;
var keyMax;
var pingDays = {};

const pingAvgTotal = {};

const getPingData = async (user) => {
  if (keyCount >= keyMax + 5) return { throttle: true, username: user };

  return new Promise(async (resolve) => {
    const requestTime = Date.now();
    const url = `https://api.antisniper.net/v2/player/ping?key=9ef7ff59-e9ee-4f50-8998-4e6130122845&player=${user}`;
    const headers = {
      'User-Agent': 'Mr. Take That Jack David(jd)'
    };
    try {
      const response = await fetch(url, { headers });
      const body = await response.json();

      if (body.throttle) {
        resolve({ throttle: true, username: user });
      } else if (body.cause == "Invalid API key") {
        resolve({ invalid: true, username: user });
      } else if (body.success === false || body.data.length === 0) {
        resolve({ exists: false, username: user });
      } else {
        const uniqueDays = new Set();
        body.data.forEach((pingRecord) => uniqueDays.add(pingRecord.day));

        const daysCount = uniqueDays.size;

        // Filter out pings over 500 ms
        const filteredPings = body.data.map((pingRecord) => pingRecord.avg).filter(ping => ping <= 500);

        if (filteredPings.length === 0) {
          resolve({ exists: false, username: user, message: 'All pings are over 500 ms' });
          return;
        }

        const mostRecentPing = filteredPings.pop();
        const averagePing = filteredPings.reduce((sum, ping) => sum + ping, 0) / filteredPings.length;


        pingDays[user] = daysCount || 0;
        pingAvgTotal[user] = averagePing.toFixed(0);

        resolve({
          ping: mostRecentPing || "ND",
          daysCount: daysCount,
          requestedAt: requestTime,
        });
      }
    } catch (error) {
      console.error(`Error fetching ping data for ${user}: ${error.message}`);
      resolve({ outage: true, username: user });
    }
  });
};


async function findLongestGap(user) {
  return new Promise(async (resolve) => {
    try {
      const requestTime = Date.now();
      const url = `https://api.antisniper.net/v2/player/played?key=${APIKEY}&player=${user}&legacy=true`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success || !data.data || data.data.length === 0) {
        resolve('NoData');
        return;
      }

      let longestGap = 0;
      let longestGapStart = null;
      let longestGapEnd = null;
      const oneWeekAgo = Math.floor(Date.now() / 1000) - (6 * 24 * 60 * 60);

      // Reverse the data array
      const reversedData = data.data.reverse();

      for (let i = 0; i < reversedData.length - 1; i++) {
        const currentTimestamp = reversedData[i].timestamp;
        const nextTimestamp = reversedData[i + 1].timestamp;
        const timeDifference = nextTimestamp - currentTimestamp;

        if (timeDifference > longestGap && nextTimestamp >= oneWeekAgo) {
          longestGap = timeDifference;
          longestGapStart = currentTimestamp;
          longestGapEnd = nextTimestamp;
        }
      }

      if (longestGap > 0) {
        resolve({
          gap: longestGap,
          longestGapStart,
          longestGapEnd,
        });
      } else {
        resolve('NoGapFound');
      }
    } catch (error) {
      console.error('Error:', error.message);
      resolve({ error: error.message, username: user });
    }
  });
}



const addPlayer = async (player, options) => {

  if (player in johnPlayers) {
    // console.log("")
  }
  else {
    persistentPlayerEncounters[player] = (persistentPlayerEncounters[player] || 0) + 1;
  }

  if (cachedPlayers[player]) {
    getPlayerSafelist(player, playeruuidDict[player.toLowerCase()]).then((data) => {
      if(data) {
        Player.safelist = data[player];
      }
    });
    getPlayerBlacklist(player, playeruuidDict[player.toLowerCase()]).then((data) => {
      if(data) {
        Player.blacklist = data[player];
      }
    });
    getPlayerQueueData(player).then((data) => {
      if (data) {
        Player.queueData = data[player]
      }
    });
    getPlayerIps(playeruuidDict[player.toLowerCase()], keysXD)
              .then((data) => {
                if (data && Array.isArray(data)) {
                  ipDictionary[player] = data.map(item => ({
                    last_seen: item.last_seen,
                    server: item.server,
                    time: item.last_seen
                  }));
                }
                console.log('ipDictionary:', ipDictionary);  
              })
              .catch(error => console.error('Error fetching player IPs:', error));
    createLegacyQueuesDictionary(playeruuidDict[player.toLowerCase()], player).then((data) => {
      if (data) {
        Player.LegacyQueues = data[player]
        }
        });
      

    


    var Player = cachedPlayers[player];
    johnPlayers[player] = Player;

    players.push(Player);
    removeDuplicates();
  
  } else {



    if (!options) options = {};
    if (!options.forced) playersInQueue.push(player);
    if (options.party) playersInParty.push(player);
    if (!players.some((p) => p.username === player) || options.forced) {
      axiosClient
        .get(`https://api.antisniper.net/v2/prism/hypixel/player?key=${APIKEY}&player=${player}&force_cache=true`, {
          headers: {
            "Reason": "Player Stats lmk if can't use",
          }
        })
        .then(async (data) => {
          if ((playersInQueue.includes(player) && inLobby !== true) || options.forced) {
            // console.log(data);

            var Player = { success: true, username: data.data.ign || 0, UUID: data.data.uuid || 0, dasheduuid: data.data._id, rank: data.data.general_stats.rank || null, level: data.data.general_stats.bedwars_star || 0, plusColor: data.data.general_stats.rankPlusColor || 0, plusPlusColor: data.data.general_stats.monthlyRankColor || 0, ...data.data.overall || 0 };
      


            // console.log(Player);

            Player.cores = {

              wins: Player.Wins || 0,
              winstreak: data.data.max_possible_winstreaks.overall_winstreak || 0,
              losses: Player.Losses || 0,
              WLR: Player.WLR || 0,
              finalKills: Player["Final Kills"] || 0,
              finalDeaths: Player["Final Deaths"] || 0,
              FKDR: Player.FKDR || 0,
              KDR: Player.KDR || 0,
              BBLR: Player.BBLR || 0,
              resourcesCollected: {
                iron: Player.Iron || 0,
                gold: Player.Gold || 0,
                diamond: Player.Diamonds || 0,
                emerald: Player.Emeralds || 0
              },
            };

            // if (dataStore.get("developerMode") === true) {
            //   Player.headers = data.headers;
            // }

            if (playersInParty.includes(player)) Player.icons.push({ tooltip: "Party", color: "indigo", name: "mdi-account-group" });
            if (options.mention) Player.icons.push({ tooltip: "This person mentioned you!", color: "yellow-lighten-3", name: "mdi-at" });

            players.push(Player);
            removeDuplicates();
            cachedPlayers[player] = Player;
            johnPlayers[player] = Player;
            getPingData(player).then((pinger) => {
              if (typeof pinger === 'object' && pinger.hasOwnProperty('ping')) {
                Player.ping = pinger.ping;
              }
            });
            playeruuidDict[player.toLowerCase()] = Player.UUID.replace(/-/g, "")
            // console.log(playeruuidDict)
            getPugData(Player.UUID, player).then((data) => {
              if (data) {
                Player.pugData = data[player];
              }
            });

            // createPlayerFriendsDictionary(player, Player.UUID.replace(/-/g, "")).then((data) => {
            //   if(data) {
            //     Player.friendedData = data[player];
            //   }
            // });
            getPlayerSafelist(player, Player.UUID.replace(/-/g,"")).then((data) => {
              if(data) {
                Player.safelist = data[player];
              }
            });
            getPlayerBlacklist(player, playeruuidDict[player.toLowerCase()]).then((data) => {
              if(data) {
                Player.blacklist = data[player];
              }
            });
            createRecentGamesDictionary(Player.UUID, player).then((data) => {
              if (data) {
                Player.recentGamesData = data[player];
              }
            })

            getPlayerIps(Player.UUID, keysXD)
              .then((data) => {
                if (data && Array.isArray(data)) {
                  ipDictionary[player] = data.map(item => ({
                    last_seen: item.last_seen,
                    server: item.server,
                    time: item.last_seen
                  }));
                }
                console.log('ipDictionary:', ipDictionary);  
              })
              .catch(error => console.error('Error fetching player IPs:', error));


            getPlayerQueueData(player).then((data) => {
              if (data) {
                Player.queueData = data[player]
              }
            });
            updatePlayerFriends(player).then((data) => {
              if (data) {
                Player.playerFriends = data[player]
              }
            });
            createLegacyQueuesDictionary(Player.UUID, player).then((data) => {
              if (data) {
                Player.LegacyQueues = data[player]
              }
            });
            updatePlayerLanguage(Player.UUID, player).then((data) => {
              if (data) {
                Player.Languages = data[player]
              }
            });
            createPlayerProfileDictionary(Player.UUID, player).then((data) => {
              if (data) {
                Player.ProfileDictionary = data[player]
              }
            });



    
          }
        })
        .catch((error) => {
          if (inLobby !== true || options.forced) {
            if (error.response && error.response.data) {
              if (error.response.data.player === null) {
                players.push({ success: true, player: null, username: player });
              } else {
                let cause = (error.response.data.cause) ? error.response.data.cause : "Unknown Error";
                if (cause.toLowerCase() === "this player never played hypixel" && inLobby === false) cause = "Invalid UUID or Username";
                players.push({ success: false, cause, username: player });
              }
            } else {
              players.push({ success: false, cause: "Unknown Error", username: player });
            }
            removeDuplicates();
          }
        });
    }
  }
};


const removePlayer = (player) => {
  playersInQueue = playersInQueue.filter((p) => {
    return p !== player;
  });
  playersInParty = playersInParty.filter((p) => {
    return p !== player;
  });
  players = players.filter((p) => {
    return p.username !== player;
  });
};

const clear = () => {
  playersInQueue = [];
  players = [];
  playersInParty = [];
  playerFriendsDictionaries = {}
  playerProfileDictionaries = {}
  queueDictionaries = {}
  legacyQueuesDictionaries = [];
  playerGuildDictionary = [];
  playerRecentgamesDictionaries = [];
  questCompletionTimes = [];
  safelistedDict = {}
  ipDictionary = {}

};
const addPlayerToSafeList = async (uuid, name) => {
  try {
    const time = new Date().getTime();
    const response = await axios.post(`https://johnify.xyz/safelist`, {
      uuid,
      time,
      name
    }, {
      headers: { key: 'John' } // Replace with the appropriate API key
    });
    console.log('added player', uuid)
    return response.data;
  } catch (error) {
    console.error(`Error adding ${uuid} to safelist via API:`, error.response ? error.response.data : error.message);
  }
};


const addPlayerToBlacklist = async (uuid, name, reason) => {
  try {
    const time = new Date().getTime();
    const response = await axios.post(`https://johnify.xyz/blacklist`, {
      uuid,
      time,
      name, 
      reason
    }, {
      headers: { key: 'John' } // Replace with the appropriate API key
    });
    console.log('added player', uuid)
    return response.data;
  } catch (error) {
    console.error(`Error adding ${uuid} to blacklist via API:`, error.response ? error.response.data : error.message);
  }
};

var lastMessage = "";
const parseMessage = (msg) => {
  if (msg.indexOf("ONLINE:") !== -1 && msg.indexOf(",") !== -1) {
    clear();
    inLobby = false;
    // loadSafelistJson();

    who = msg.substring(8).split(", ");
    // console.log(who)
    for (let i = 0; i < who.length; i++) {
      if (who[i].includes("[") && i == who.length - 1) {
        addPlayer(who[i].slice(0, who[i].indexOf("[") - 1)); // Needed for Anti-Spam features in Clients that compact chat by adding [x3] etc.
        break;
      }
      addPlayer(who[i]);
    }
  }
  else if (msg.indexOf("has joined") !== -1 && msg.indexOf(":") === -1) {
    inLobby = false;
    addPlayer(msg.split(" ")[0]);

  } else if (msg.indexOf("has quit") !== -1 && msg.indexOf(":") === -1) {
    inLobby = false;
    removePlayer(msg.split(" ")[0]);
  }
  else if (msg.indexOf("Sending you") !== -1 && msg.indexOf(":") === -1) {
    johnPlayers = {};

    inLobby = false;
    clear();
    johnPlayers = {};

    if (dataStore.get("queueNotification") === true) {
      ipcRenderer.send("notification", "You have queued a game!");
    }
    if (dataStore.get("hideIngame") === true) {
      ipcRenderer.send("windowEvent", "show");
    }
  } else if (!inLobby && (msg.indexOf("joined the lobby!") !== -1 || msg.indexOf("rewards!") !== -1 || (lastMessage.trim().length === 0 && msg.trim().length === 0)) && msg.indexOf(":") === -1) {
    clear();
    johnPlayers = {};

    if (dataStore.get("hideIngame") === true) {
      ipcRenderer.send("windowEvent", "show");
    }
    inLobby = true;
  } else if ((msg.indexOf("Party Leader:") === 0 || msg.indexOf("Party Members:") === 0 || msg.indexOf("Party Moderators:") === 0) && inLobby) {
    let pmsg = msg.substring(msg.indexOf(":") + 2);
    let who = pmsg.split(" ");
    for (let i = 0; i < who.length; i++) {
      const playerName = updateStringCondition(who[i].trim());
      if (playerName && /^[a-zA-Z0-9_]+$/.test(playerName)) {
        addPlayer(playerName, { forced: true, party: true });
        excludedPlayers.push(playerName);
      }
    }

  } else if (msg.indexOf("joined the party") !== -1 && msg.indexOf(":") === -1 && inLobby) {
    addPlayer(updateStringCondition(msg), { forced: true, party: true });
    addPlayer(dataStore.get("player"), { forced: true, party: true });
  } else if (msg.indexOf("left the party") !== -1 && msg.indexOf(":") === -1 && inLobby) {
    removePlayer(updateStringCondition(msg));
  } else if (msg.indexOf("You left the party") !== -1 && msg.indexOf(":") === -1 && inLobby) {
    clear();
  } else if ((msg.indexOf("The party was disbanded") !== -1 || msg.indexOf("has disbanded the party!") !== -1) && msg.indexOf(":") === -1 && inLobby) {
    clear();
  } else if (msg.toLowerCase().indexOf(dataStore.get("player").toLowerCase()) !== -1 && msg.indexOf("Party") === -1 && msg.indexOf(":") > -1 && inLobby) {
    var player = null;
    if (msg.indexOf("Guild") !== -1 || msg.indexOf("Officer") !== -1) {
      var parsedMessage = msg.slice(0, msg.indexOf(":")).split(" ");
      if (parsedMessage.length === 5) {
        player = parsedMessage[3];
      } else {
        player = parsedMessage[4];
      }
    } else {
      player = msg.slice(0, msg.indexOf(":")).split(" ").slice(-1)[0];
    }
  } else if ((msg.indexOf("FINAL KILL") !== -1) && msg.indexOf(":") === -1) {
    inLobby = false;
    removePlayer(msg.split(" ")[0]);
    const playerName = msg.split(" ")[0];

    safelistedPlayers.push(playerName);
    addPlayerToSafeList(playeruuidDict[playerName.toLowerCase()], "Yogi");

  }else if ((msg.indexOf("disconnected") !== -1) && msg.indexOf(":") === -1){
    inLobby = false;
    removePlayer(msg.split(" ")[0]);


  } else if (msg.indexOf("reconnected") !== -1 && msg.indexOf(":") === -1) {
    inLobby = false;
    addPlayer(msg.split(" ")[0]);
  } else if (msg.indexOf("Can't find a player by the name of '.s'") !== -1) {
    ipcRenderer.send("windowEvent", "show");

   } if (msg.indexOf("Added enemy:") !== -1) {
    let startIndex = msg.indexOf("Added enemy:") + "Added enemy:".length;
    let enemyName = msg.slice(startIndex).trim(); // Output: peng_87


    console.log(enemyName); 

    addPlayerToBlacklist(playeruuidDict[enemyName.toLowerCase()], "Yogi", "raven detect")
}
  else if (msg.indexOf("Can't find a player by the name of '.h'") !== -1) {
    ipcRenderer.send("windowEvent", "hide");

  }

  else if ((msg.indexOf("Protect your bed and destory the enemy beds.") !== -1 || msg.indexOf("The game is starting in 1 seconds!") !== -1 || msg.indexOf("The game is starting in 0 seconds!") !== -1) && msg.indexOf(":") === -1) {
    if (dataStore.get("hideIngame") === true) {
      ipcRenderer.send("windowEvent", "hide");
    }

    if (dataStore.get("gameStartNotification") === true) {
      ipcRenderer.send("notification", "The game has started!");
    }
  }
  lastMessage = msg;
};

// app.whenReady().then(() => {
//   globalShortcut.register('`', () => {
//     // Check the current state of the window and toggle it
//     if (windowIsHidden) {
//       ipcRenderer.send("windowEvent", "show");
//     } else {
//       ipcRenderer.send("windowEvent", "hide");
//     }
//     // Update the windowIsHidden variable after toggling the window state
//     windowIsHidden = !windowIsHidden;
//   });
// });

// Unregister all global shortcuts when the app is quitting


const getPlayers = (who) => {
  if (!who || who.length === 0) {
    return players;
  }

  return players.sort((a, b) => {
    const indexA = who.indexOf(a.username);
    const indexB = who.indexOf(b.username);

    if (indexA === -1 && indexB === -1) return 0;  // 
    if (indexA === -1) return 1;  //
    if (indexB === -1) return -1; // 

    if (indexA > indexB) {
      return 1;
    } else if (indexA < indexB) {
      return -1;
    }
    return 0;
  });
};






var refreshing = false;

const refreshPlayers = () => {
  if (refreshing === false) {
    refreshing = true;
    for (const player of players) {
      addPlayer(player.username, { forced: true });
    }
    setTimeout(() => {
      refreshing = false;
    }, 1000);
  }
};

/**
 * @param {String} string
 * @returns
 * Check if "[" is present in string
 */
const updateStringCondition = (string) => {
  var inputString = string.split(" ")[0];
  if (inputString.indexOf("[") !== -1) {
    inputString = string.split(" ")[1];
  }
  return inputString;
};

export { parseMessage, getPlayers, addPlayer, refreshPlayers, clear, who, pingDays, pingAvgTotal };
