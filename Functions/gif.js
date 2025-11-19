const axios = require('axios');

/**
 * Get a random GIF from Tenor API
 * @param {string} searchTerm - The search term for the GIF
 * @param {string} tenorApiKey - Tenor API key from config
 * @returns {Promise<string|null>} - URL of the GIF or null if error
 */
async function getRandomGif(searchTerm, tenorApiKey) {
    // If no API key is configured, return null (graceful degradation)
    if (!tenorApiKey) {
        return null;
    }

    try {
        const response = await axios.get('https://tenor.googleapis.com/v2/search', {
            params: {
                q: searchTerm,
                key: tenorApiKey,
                client_key: 'bet_it_all_discord_bot',
                limit: 20, // Get 20 results to choose from
                media_filter: 'gif',
                ar_range: 'wide', // Prefer wide aspect ratios for embeds
            },
        });

        if (response.data && response.data.results && response.data.results.length > 0) {
            // Pick a random GIF from the results
            const randomIndex = Math.floor(Math.random() * response.data.results.length);
            const gif = response.data.results[randomIndex];

            // Return the GIF URL (using the original size)
            return gif.media_formats.gif.url;
        }

        return null;
    } catch (error) {
        console.error('Error fetching GIF from Tenor:', error.message);
        return null;
    }
}

/**
 * Get GIF search terms for different game situations
 */
const GIF_SEARCH_TERMS = {
    // Chicken game
    chickenChallenge: 'gambling duel showdown',
    chickenEscalate: 'tension dramatic poker',
    chickenWin: 'celebration winning jackpot',
    chickenLose: 'fail funny loss',

    // Blackjack
    blackjackStart: 'casino cards gambling',
    blackjackWin: 'winning celebration money',
    blackjackLose: 'losing broke sad',
    blackjackBlackjack: 'jackpot big win celebration',
    blackjackBust: 'fail explosion bust',

    // General
    levelUp: 'level up upgrade power',
    dailyReward: 'money rain cash',
    bigBet: 'high stakes all in',
};

module.exports = {
    getRandomGif,
    GIF_SEARCH_TERMS,
};
