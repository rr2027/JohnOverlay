const APIKEY = 'fd1101bd-7e5c-4057-8985-0316fd5b8237';
const uuid = '16d31b23062d464c9686d9ea9efb1fb8';
const playerName = 'TestPlayer';

async function fetchSkyblockProfiles(uuid) {
    const apiUrl = `https://api.hypixel.net/v2/skyblock/profiles?key=${APIKEY}&uuid=${uuid}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
}

async function createDungeonTeammatesDictionary(uuid, playerName) {
    try {
        const profilesData = await fetchSkyblockProfiles(uuid);
        console.log("Profiles Data:", profilesData);

        const teammatesDictionary = {};

        profilesData.profiles.forEach(profile => {
            console.log("Processing Profile:", profile);
            const profileMembers = profile.members;
            for (const memberUUID in profileMembers) {
                if (profileMembers.hasOwnProperty(memberUUID)) {
                    console.log("Processing Member:", memberUUID);

                    // Extract dungeon teammates
                    const dungeons = profileMembers[memberUUID].dungeons;
                    if (dungeons && dungeons.dungeon_types) {
                        console.log("Processing Dungeons for Member:", memberUUID);
                        for (const dungeonType in dungeons.dungeon_types) {
                            const dungeonData = dungeons.dungeon_types[dungeonType];
                            if (dungeonData.best_runs) {
                                console.log("Processing Best Runs for Dungeon Type:", dungeonType);
                                for (const runType in dungeonData.best_runs) {
                                    const runs = dungeonData.best_runs[runType];
                                    runs.forEach(run => {
                                        run.teammates.forEach(teammateUUID => {
                                            if (!teammatesDictionary[teammateUUID]) {
                                                teammatesDictionary[teammateUUID] = [];
                                            }
                                            teammatesDictionary[teammateUUID].push({
                                                memberUUID,
                                                timestamp: run.timestamp
                                            });
                                            console.log("Added Teammate UUID:", teammateUUID);
                                        });
                                    });
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log("Dungeon Teammates Dictionary:", teammatesDictionary);

    } catch (error) {
        console.error(`Error fetching profiles for ${playerName}: ${error.message}`);
    }
}

// Run the function
createDungeonTeammatesDictionary(uuid, playerName);
