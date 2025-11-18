const { loadCommands } = require('../../Handlers/commandHandler');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✓ ${client.user.tag} is online!`);

        // Load commands
        await loadCommands(client);

        // Set activity
        client.user.setActivity('Blackjack 🃏 | /help', { type: 'PLAYING' });

        console.log('✓ Bot is fully ready!');
    }
}