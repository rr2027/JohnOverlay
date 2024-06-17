
const fetch = require('node-fetch');

async function findLongestGap(user) {

    return new Promise(async (resolve) => {
        try {
            const requestTime = Date.now();
            const url = `https://api.antisniper.net/v2/player/played?key=131a0dc9-c35b-4830-b2d2-d9aa58d8c54f&player=${user}&legacy=true`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.success || !data.data || data.data.length === 0) {
                resolve('NoData');
                return;
            }

            let longestGap = 0;
            let longestGapStart = null;
            let longestGapEnd = null;
            const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

            for (let i = 0; i < data.data.length - 1; i++) {
                const currentTimestamp = data.data[i].timestamp;
                const nextTimestamp = data.data[i + 1].timestamp;
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
async function printLongestGap(user) {
    try {
        const result = await findLongestGap(user);

        if (result === 'NoData') {
            console.log(`No data found for user ${user}`);
        } else if (result === 'NoGapFound') {
            console.log(`No gap found for user ${user}`);
        } else if (result.error) {
            console.error(`Error occurred for user ${user}: ${result.error}`);
        } else {
            console.log(`Longest gap for user ${user}:`);
            console.log(`Start: ${new Date(result.longestGapStart * 1000)}`);
            console.log(`End: ${new Date(result.longestGapEnd * 1000)}`);
            console.log(`Gap: ${result.gap} seconds`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

printLongestGap("Andorite");
