const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎰 Bet It All - Help')
            .setDescription('A Discord bot with leveling, credits, and multiplayer blackjack!')
            .addFields(
                {
                    name: '💰 Credit Commands',
                    value: '`/balance` - Check your credits and stats\n' +
                           '`/daily` - Claim daily credits\n' +
                           '`/transfer <user> <amount>` - Transfer credits to another user\n' +
                           '`/give <user> <amount>` - Give credits (Admin only)',
                    inline: false,
                },
                {
                    name: '🎮 Game Commands',
                    value: '`/blackjack <bet>` - Start a multiplayer blackjack game\n' +
                           '• Click "Join Game" to join an existing game\n' +
                           '• Click "Start Game" to begin\n' +
                           '• Use Hit/Stand buttons during your turn',
                    inline: false,
                },
                {
                    name: '📊 Info Commands',
                    value: '`/leaderboard [type]` - View server leaderboards\n' +
                           '• Types: credits, level, wins',
                    inline: false,
                },
                {
                    name: '🔇 Mute Commands',
                    value: '`/mute <user> <minutes>` - Mute a user with credits\n' +
                           '• Cost: 1000 credits per minute\n' +
                           '• Max: 60 minutes',
                    inline: false,
                },
                {
                    name: '⭐ Leveling System',
                    value: '• Gain XP by chatting in the server\n' +
                           '• Level up to earn bonus credits\n' +
                           '• Higher levels = more daily credits',
                    inline: false,
                },
                {
                    name: '🎰 How to Play Blackjack',
                    value: '1. Start a game with `/blackjack <bet>`\n' +
                           '2. Other players can join with the same bet\n' +
                           '3. Host starts the game\n' +
                           '4. Take turns to Hit or Stand\n' +
                           '5. Get closer to 21 than the dealer without busting!\n' +
                           '• Blackjack pays 2.5x your bet\n' +
                           '• Regular wins pay 2x your bet',
                    inline: false,
                },
            )
            .setFooter({ text: 'Have fun and gamble responsibly! 🎲' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
