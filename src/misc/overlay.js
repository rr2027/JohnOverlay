import axios from "axios";
import axiosRetry from "axios-retry";
import { useIpcRenderer } from "@vueuse/electron";
var cachedPlayers = {};
const { app } = require('electron'); // Import the app module from Electron
var johnPlayers = {}
export let persistentPlayerEncounters = {}; // This will store the encounter counts

const fs = require('fs/promises'); // Import the 'fs' module for file operations
; // This will store the encounter counts






function formatTimeDifference(seconds) {
  const yearInSeconds = 31536000; // 365 days in seconds (approximately)
  const monthInSeconds = 2592000; // 30 days in seconds (approximately)
  const dayInSeconds = 86400; // 24 hours in seconds
  const hourInSeconds = 3600; // 60 minutes in seconds

  let result = "";
  let unitCount = 0; // Counter for the number of units added

  const years = Math.floor(seconds / yearInSeconds);
  if (years > 0 && unitCount < 2) {
    result += `${years}y`;
    seconds %= yearInSeconds;
    unitCount++;
  }

  const months = Math.floor(seconds / monthInSeconds);
  if (months > 0 && unitCount < 2) {
    result += `${months}mo`;
    seconds %= monthInSeconds;
    unitCount++;
  }

  const days = Math.floor(seconds / dayInSeconds);
  if (days > 0 && unitCount < 2) {
    result += `${days}d`;
    seconds %= dayInSeconds;
    unitCount++;
  }

  const hours = Math.floor(seconds / hourInSeconds);
  if (hours > 0 && unitCount < 2) {
    result += `${hours}h`;
  }

  return result;
}

import dataStore from "../data/dataStore";
import { sendNotification } from "./snackbarNotification";
//import blacklistParser from "./blacklistParser";

const ipcRenderer = useIpcRenderer();

var players = [];
async function getPlayerQueueData(playerName) {
  const apiKey = '553c6494-8e2e-46a8-a369-0ed91196fe36';
  const apiUrl = `https://api.antisniper.net/v2/player/queues?key=${apiKey}&player=${playerName}`;

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

      // Loop through data.data and extract UUIDs
      for (const queueItem of data.data) {
        for (const item of queueItem.queue) {
          playerData[playerName].queue.push(item.uuid);
        }
      }

      // Append the playerData to queueDictionaries
      queueDictionaries[playerName] = playerData[playerName];


      return playerData;
    } else {
      throw new Error(`API request was not successful: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${playerName}: ${error.message}`);
    return {};
  }
}
export let playerFriendsDictionaries = {}; // Global variable to store player friends dictionaries
var playersInQueue = []; // Needed as the API Requests can't be handled instantly
var playersInParty = [];
export let queueDictionaries = {};
export let playerProfileDictionaries = {} 
export let legacyQueuesDictionaries = {}

let lastUsedKeyIndex = 0;

async function fetchSkyblockProfiles(uuid) {
  const apiKeys = [
    '06c43cf8-bf39-450f-88b2-e3f8f13fe85b',
    'a62fc2ad-7fa4-4016-b3e3-742cae405cf5'
  ];

  // Alternate between keys
  const apiKey = apiKeys[lastUsedKeyIndex];
  lastUsedKeyIndex = (lastUsedKeyIndex + 1) % apiKeys.length;

  const apiUrl = `https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching profiles for UUID ${uuid} with API key ${apiKey}: ${error.message}`);
    return { profiles: [] }; // Return an empty array on error
  }
}
async function createPlayerProfileDictionary(uuid, playerName) {

  try {
    const profilesData = await fetchSkyblockProfiles(uuid);

    // Create a separate dictionary for this player
    const playerDictionary = {
      ign: playerName,
      members: {} // Use an object to store member UUIDs and their associated data
    };

    // Iterate through profiles and save first_join under each member's UUID
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

    // Update the global dictionary for this specific player
    playerProfileDictionaries[playerName] = playerDictionary;

    // Log the updated dictionary

  } catch (error) {
    console.error(`Error fetching profiles for ${playerName}: ${error.message}`);
    // In case of error, ensure an empty structure for consistency
    playerProfileDictionaries[playerName] = {
      ign: playerName,
      members: {}
    };
  }
}

async function createLegacyQueuesDictionary(playerName) {
  const apiKey = '553c6494-8e2e-46a8-a369-0ed91196fe36';
  const apiUrl = `https://api.antisniper.net/v2/player/queues/legacy?key=${apiKey}&player=${playerName}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      const tablistUuids = []; // Create an array to store tablist UUIDs

      // Iterate through all data entries
      for (const entry of data.data) {
        // Iterate through the tablist entries and extract UUIDs
        for (const playerName in entry.tablist) {
          if (entry.tablist.hasOwnProperty(playerName)) {
            const tablistEntry = entry.tablist[playerName];
            if (typeof tablistEntry === 'string') {
              // Check if it's a UUID (string)
              const uuid = tablistEntry.replace(/[^a-f0-9]/ig, ''); // Remove all non-hex characters
              tablistUuids.push(uuid);
            }
          }
        }
      }

      // Append the tablistUuids to legacyQueuesDictionaries
      legacyQueuesDictionaries[playerName] = tablistUuids;

      return tablistUuids;
    } else {
      throw new Error(`API request was not successful: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`Error fetching legacy queues for ${playerName}: ${error.message}`);
    return [];
  }
}
async function fetchFriends(playerName) {
  const apiUrl = `https://api.sk1er.club/friends/${playerName}`;
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
async function createPlayerFriendsDictionary(playerName) {
  try {
      const friendsData = await fetchFriends(playerName);

      // Check if the fetch was unsuccessful and initialize friends as an empty array
      if (friendsData && friendsData.success === false) {
          console.log("bye bye")
      } else {
          // Update the global dictionary for this specific player
          playerFriendsDictionaries[playerName] = {
              ign: playerName,
              friends: friendsData
          };
      }

  } catch (error) {
      console.error(`Error fetching friends for ${playerName}:`, error.message);
      // In case of an error, ensure an empty structure for consistency
      playerFriendsDictionaries[playerName] = {
          ign: playerName,
          friends: []
      };
  }
}


// Now, let's implement the friend-checking logic

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
const getPingData = async (user) => {
  if (keyCount >= keyMax + 5) return { throttle: true, username: user };

  return new Promise(async resolve => {
      const requestTime = Date.now();
      const url = `https://api.antisniper.net/v2/player/ping?key=553c6494-8e2e-46a8-a369-0ed91196fe36&player=${user}`;
              const apiUrl = `https://api.antisniper.net/v2/player/days?key=553c6494-8e2e-46a8-a369-0ed91196fe36&player=${user}`;

      const data = await fetch(url);

      try {
          var body = await data.json();
      } catch {
          resolve({ outage: true, username: user });
      }

      if (body.throttle) resolve({ throttle: true, username: user });
      if (body.cause == "Invalid API key") resolve({ invalid: true, username: user });
      if (body.success === false || body.data.length === 0) {
          resolve({ exists: false, username: user });
      } else {
          // Extract the most recent avg ping
          const mostRecentAvgPing = body.data[body.data.length - 1].avg;

          resolve({
              ping: mostRecentAvgPing || "N/A",
              requestedAt: requestTime
          });
      }
  });
};
async function findLongestGap(user) {

  return new Promise(async (resolve) => {
      try {
          const requestTime = Date.now();
          const url = `https://api.antisniper.net/v2/player/played?key=553c6494-8e2e-46a8-a369-0ed91196fe36&player=${user}&lookback=7884000`;
          const response = await fetch(url);
          const data = await response.json();

          if (!data.success || !data.data || data.data.length === 0) {
              resolve('NoData');
              return;
          }

          let longestGap = 0;
          let longestGapStart = null;
          let longestGapEnd = null;
          const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // Current time minus two weeks

          for (let i = 0; i < data.data.length - 1; i++) {
              const currentTimestamp = data.data[i].timestamp;
              const nextTimestamp = data.data[i + 1].timestamp;
              const timeDifference = nextTimestamp - currentTimestamp;

              // Check if the gap is the longest and if the end of the gap is within the last two weeks
              if (timeDifference > longestGap && nextTimestamp >= oneWeekAgo) {
                  longestGap = timeDifference;
                  longestGapStart = currentTimestamp;
                  longestGapEnd = nextTimestamp;
              }
          }

          if (longestGap > 0) {
              resolve({
                  gap: longestGap, // Include the gap duration

                  longestGapStart, // Add the start and end timestamps to the result
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

  if (player in johnPlayers){
    console.log("")}
    else{
      persistentPlayerEncounters[player] = (persistentPlayerEncounters[player] || 0) + 1;
     } 
  
  if (cachedPlayers[player]) {

    await createPlayerFriendsDictionary(player);
    await createLegacyQueuesDictionary(player);
    console.log("Using cached player data for " + player);

    // Use the cached player data directly
    var Player = cachedPlayers[player];
    johnPlayers[player] = Player;

    players.push(Player);
    removeDuplicates();
    await getPlayerQueueData(Player.UUID);
    await createPlayerProfileDictionary(Player.UUID, player);

    console.log(Player);
  } else {
    console.log("Fetching player data for " + player);

    await createPlayerFriendsDictionary(player);
    await createLegacyQueuesDictionary(player);
    const pingData = await getPingData(player);
    if (!options) options = {};
    if (!options.forced) playersInQueue.push(player);
    if (options.party) playersInParty.push(player);
    if (!players.some((p) => p.username === player) || options.forced) {
      axiosClient
        .get(`https://api.antisniper.net/v2/hypixel/player?key=553c6494-8e2e-46a8-a369-0ed91196fe36&player=${player}&force_cache=true`, {
          headers: {
            "Reason": "John",
          }
        })
        .then(async (data) => {
          if ((playersInQueue.includes(player) && inLobby !== true) || options.forced) {
            console.log(data);

            // Create a new Player object using the fetched data
            var Player = { success: true, username: data.data.ign || 0, UUID: data.data.uuid || 0, rank: data.data.general_stats.rank || null, level: data.data.general_stats.bedwars_star || 0, plusColor: data.data.general_stats.rankPlusColor || 0, plusPlusColor: data.data.general_stats.monthlyRankColor || 0, ping: pingData.ping || "ND", ...data.data.overall || 0 };
            await getPlayerQueueData(Player.UUID);
            await createPlayerProfileDictionary(Player.UUID, player);
            console.log(Player);

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

            if (dataStore.get("developerMode") === true) {
              Player.headers = data.headers;
            }

            if (playersInParty.includes(player)) Player.icons.push({ tooltip: "Party", color: "indigo", name: "mdi-account-group" });
            if (options.mention) Player.icons.push({ tooltip: "This person mentioned you!", color: "yellow-lighten-3", name: "mdi-at" });

            // Add the player to the list
            players.push(Player);
            removeDuplicates();
            cachedPlayers[player] = Player;
            johnPlayers[player] = Player;


            // Fetch and update the longest gap for the player
            findLongestGap(player).then((gapper) => {
              if (typeof gapper === 'object' && gapper.hasOwnProperty('gap')) {
                Player.gaps = formatTimeDifference(gapper.gap) || "ND";
                console.log(Player.gaps)
              }
            });
          }
        })
        .catch((error) => {
          if (inLobby !== true || options.forced) {
            if (error.response && error.response.data) {
              if (error.response.data.player === null) {
                // Handle the case where response has player: null
                players.push({ success: true, player: null, username: player });
              } else {
                // Handle other error cases
                let cause = (error.response.data.cause) ? error.response.data.cause : "Unknown Error";
                if (cause.toLowerCase() === "this player never played hypixel" && inLobby === false) cause = "Invalid UUID or Username";
                players.push({ success: false, cause, username: player });
              }
            } else {
              // Handle cases where data property is missing
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
  playerFriendsDictionaries = [];
  playerProfileDictionaries= [];
  queueDictionaries = [];
  legacyQueuesDictionaries = [];
};

var lastMessage = "";

const parseMessage = (msg) => {
  if (msg.indexOf("ONLINE:") !== -1 && msg.indexOf(",") !== -1) {
    clear();
    inLobby = false;
    let who = msg.substring(8).split(", ");
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
    johnPlayers= {};

    inLobby = false;
    clear();
    johnPlayers= {};

    if (dataStore.get("queueNotification") === true) {
      ipcRenderer.send("notification", "You have queued a game!");
    }
    if (dataStore.get("hideIngame") === true) {
      ipcRenderer.send("windowEvent", "show");
    }
  } else if (!inLobby && (msg.indexOf("joined the lobby!") !== -1 || msg.indexOf("rewards!") !== -1 || (lastMessage.trim().length === 0 && msg.trim().length === 0)) && msg.indexOf(":") === -1) {
    clear();
    johnPlayers= {};

    if (dataStore.get("hideIngame") === true) {
      ipcRenderer.send("windowEvent", "show");
    }
    inLobby = true;
  } else if ((msg.indexOf("Party Leader:") === 0 || msg.indexOf("Party Members:") === 0 || msg.indexOf("Party Moderators:") === 0) && inLobby) {
    let pmsg = msg.substring(msg.indexOf(":") + 2);
    let who = pmsg.split(" ");
    for (let i = 0; i < who.length; i++) {
      if (/^[a-zA-Z0-9_]+$/.test(who[i])) {
        addPlayer(updateStringCondition(who[i]), { forced: true, party: true });
      }
    }
    addPlayer(dataStore.get("player"), { forced: true, party: true });
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
  } else if ((msg.indexOf("FINAL KILL") !== -1 || msg.indexOf("disconnected") !== -1) && msg.indexOf(":") === -1) {
    inLobby = false;
    removePlayer(msg.split(" ")[0]);
  } else if (msg.indexOf("reconnected") !== -1 && msg.indexOf(":") === -1) {
    inLobby = false;
    addPlayer(msg.split(" ")[0]);
  } else if ((msg.indexOf("The game starts in 1 second!") !== -1 || msg.indexOf("The game is starting in 1 seconds!") !== -1 || msg.indexOf("The game is starting in 0 seconds!") !== -1) && msg.indexOf(":") === -1) {
    if (dataStore.get("hideIngame") === true) {
      ipcRenderer.send("windowEvent", "hide");
    }
    if (dataStore.get("gameStartNotification") === true) {
      ipcRenderer.send("notification", "The game has started!");
    }
  }
  lastMessage = msg;
};



const getPlayers = () => {
  return players
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
 * If yes, update inputString with the second part of msg string separated by spaces
 * Useful when the user has no rank or no prefix is present in the returned string
 */
const updateStringCondition = (string) => {
  var inputString = string.split(" ")[0];
  if (inputString.indexOf("[") !== -1) {
    inputString = string.split(" ")[1];
  }
  return inputString;
};

export { parseMessage, getPlayers, addPlayer, refreshPlayers, clear };
