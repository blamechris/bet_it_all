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
                           '`/give <user> <amount>` - Give credits (Admin only)\n' +
                           '`/loan <amount>` - Get instant credits in exchange for being muted',
                    inline: false,
                },
                {
                    name: '🎮 Game Commands',
                    value: '`/blackjack <bet>` - Start a multiplayer blackjack game\n' +
                           '• Click "Join Game" to join an existing game\n' +
                           '• Click "Start Game" to begin\n' +
                           '• Use Hit/Stand buttons during your turn\n\n' +
                           '`/chicken <user> <bet>` - Challenge someone to chicken!\n' +
                           '• High-stakes nerve game with escalating mute durations\n' +
                           '• Both players bet, loser gets muted\n' +
                           '• Stakes double each round: 5m → 10m → 20m → 40m → max 1 day',
                    inline: false,
                },
                {
                    name: '📊 Info Commands',
                    value: '`/leaderboard [type]` - View server leaderboards\n' +
                           '• Types: credits, level, wins',
                    inline: false,
                },
                {
                    name: '🔇 Mute & Loan Commands',
                    value: '`/mute <user> <minutes>` - Mute a user with credits\n' +
                           '• Cost: 1000 credits per minute\n' +
                           '• Max: 60 minutes\n\n' +
                           '`/loan <amount>` - Borrow credits, get muted as payment\n' +
                           '• Rate: 1000 credits = 1 minute mute\n' +
                           '• Max loan: 5000 credits (default)\n' +
                           '• Cooldown: 24 hours between loans',
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
                {
                    name: '🐔 How to Play Chicken',
                    value: '1. Use `/chicken @user <bet>` to challenge\n' +
                           '2. Both players\' bets are deducted immediately\n' +
                           '3. One player must respond with `/chicken @opponent`\n' +
                           '4. If they say ANYTHING else, they lose and get muted!\n' +
                           '5. If they use `/chicken` back, round escalates\n' +
                           '6. Mute duration DOUBLES each round!\n' +
                           '7. Winner takes the entire pot!\n' +
                           '• Starting mute: 5 minutes\n' +
                           '• Maximum mute: 1 day (1440 minutes)\n' +
                           '• Don\'t speak... just `/chicken`!',
                    inline: false,
                },
            )
            .setFooter({ text: 'Have fun and gamble responsibly! 🎲' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
