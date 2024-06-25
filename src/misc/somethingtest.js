const ipDictionary = {
    "Pikachu5564": [
        { last_seen: 1718810626, server: '23.139.82.97:25008' },
        { last_seen: 1718768787, server: '23.139.82.97:25015' },
        { last_seen: 1709346327, server: '23.139.82.61:25001' },
        { last_seen: 1706659230, server: '23.139.82.61:25009' },
        { last_seen: 1704921966, server: '23.139.82.131:25567' },
        { last_seen: 1701453780, server: '23.139.82.61:25010' },
        { last_seen: 1693767427, server: '23.139.82.50:25001' },
        { last_seen: 1692904800, server: '23.175.145.182:25568' },
        { last_seen: 1691150655, server: '23.139.82.97:25005' },
        { last_seen: 1689968326, server: '45.59.171.22:25565' },
        { last_seen: 1689436529, server: '135.148.151.65:25696' },
        { last_seen: 1688230138, server: '149.56.243.189:2249' },
        { last_seen: 1686348174, server: '185.213.26.189:25561' },
        { last_seen: 1686344850, server: '23.175.145.182:25565' },
        { last_seen: 1679783029, server: '78.108.218.57:25587' }
    ],
    "Saint82311": [
        { last_seen: 1718923665, server: '23.139.82.97:25008' },
        { last_seen: 1717019689, server: '23.139.82.97:25015' },
        { last_seen: 1717016613, server: '23.139.82.97:25005' },
        { last_seen: 1710443853, server: '23.139.82.50:25001' },
        { last_seen: 1704402143, server: '23.145.120.170:25575' },
        { last_seen: 1703861416, server: '23.139.82.61:25010' },
        { last_seen: 1703697166, server: '23.139.82.61:25001' },
        { last_seen: 1703657134, server: '23.139.82.61:25009' },
        { last_seen: 1702414360, server: '23.139.82.50:25010' },
        { last_seen: 1699215730, server: '161.129.180.180:25565' },
        { last_seen: 1690074699, server: '23.139.82.54:10006' },
        { last_seen: 1690074331, server: '23.139.82.54:10010' },
        { last_seen: 1689480588, server: '135.148.171.228:25565' },
        { last_seen: 1689360973, server: '51.222.11.226:2206' },
        { last_seen: 1688582082, server: '150.136.223.175:25565' },
        { last_seen: 1688322898, server: '154.53.45.59:25565' },
        { last_seen: 1687066488, server: '155.248.204.84:25565' }
    ],
    "maxwinyogi": []
};

let isMatchingServer = false;
let isMatchingPlayer = "";

for (const [playerName, playerData] of Object.entries(ipDictionary)) {
    if (!Array.isArray(playerData) || playerData.length === 0) {
        continue;  // Skip if playerData is not an array or is empty
    }

    for (const { server } of playerData) {
        const [serverIp] = server.split(':');
        for (const [otherPlayerName, otherPlayerData] of Object.entries(ipDictionary)) {
            if (playerName !== otherPlayerName) {
                if (!Array.isArray(otherPlayerData) || otherPlayerData.length === 0) {
                    continue;  // Skip if otherPlayerData is not an array or is empty
                }

                for (const { server: otherServer } of otherPlayerData) {
                    const [otherServerIp] = otherServer.split(':');
                    if (serverIp === otherServerIp) {
                        isMatchingServer = true;
                        isMatchingPlayer = otherPlayerName;
                        break;
                    }
                }
            }
            if (isMatchingServer) break;
        }
        if (isMatchingServer) break;
    }
    if (isMatchingServer) break;
}

console.log('isMatchingServer:', isMatchingServer);
console.log('isMatchingPlayer:', isMatchingPlayer);
