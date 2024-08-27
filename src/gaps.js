async function fetchData() {
    const response = await fetch('https://api.antisniper.net/v2/player/sessions?player=John&key=a6fecb0a-7fac-4b77-aef3-d328290003fa');
    const jsonData = await response.json();
    return jsonData.data;
}

function findRecentGaps(data, days = 7) {
    const oneWeekAgo = Date.now() / 1000 - (days * 24 * 60 * 60); // Convert days to seconds
    let recentGapTimestamp = null;
    let previousGapTimestamp = null;
    let lastChangeTimestamp = null;

    for (let i = data.length - 1; i > 0; i--) {
        if (data[i]['live_games_played'] !== data[i - 1]['live_games_played']) {
            lastChangeTimestamp = data[i]['timestamp'];

            if (data[i]['timestamp'] >= oneWeekAgo && !recentGapTimestamp) {
                recentGapTimestamp = data[i]['timestamp'];
            } else if (recentGapTimestamp && !previousGapTimestamp) {
                previousGapTimestamp = data[i]['timestamp'];
                break;
            }
        }
    }

    return { recentGapTimestamp, previousGapTimestamp, lastChangeTimestamp };
}

async function determineGapInfo() {
    const data = await fetchData();
    const { recentGapTimestamp, previousGapTimestamp, lastChangeTimestamp } = findRecentGaps(data);

    if (recentGapTimestamp && previousGapTimestamp) {
        const differenceInSeconds = recentGapTimestamp - previousGapTimestamp;
        const differenceInDays = differenceInSeconds / (24 * 60 * 60);
        return { success: true, message: `The difference between the last two gaps is ${differenceInDays.toFixed(2)} days.` };
    } else if (recentGapTimestamp) {
        return { success: true, message: `The most recent gap was within the last week on ${new Date(recentGapTimestamp * 1000).toISOString()}. No previous gap found.` };
    } else if (lastChangeTimestamp) {
        return { success: true, message: `The last time it changed was on ${new Date(lastChangeTimestamp * 1000).toISOString()}.` };
    } else {
        return { success: true, message: "No changes detected in the data." };
    }
}

async function handleRequest(req, res) {
    try {
        const result = await determineGapInfo();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, cause: "Internal Server Error" });
    }
}

// Example usage in an Express.js route
app.get('/gaps', getApiKey, async (req, res) => {
    const player = req.query.player;
    if (!player) {
        return res.status(400).json({ success: false, cause: "missing field[player]" });
    }

    await handleRequest(req, res);
});
