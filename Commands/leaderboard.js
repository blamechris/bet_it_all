const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../Models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server leaderboard')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of leaderboard to view')
                .setRequired(false)
                .addChoices(
                    { name: 'Credits', value: 'credits' },
                    { name: 'Level', value: 'level' },
                    { name: 'Wins', value: 'wins' },
                )
        ),
    async execute(interaction) {
        const type = interaction.options.getString('type') || 'credits';

        await interaction.deferReply();

        let sortField, title, emoji;

        switch (type) {
            case 'level':
                sortField = { level: -1, xp: -1 };
                title = '📊 Level Leaderboard';
                emoji = '📊';
                break;
            case 'wins':
                sortField = { totalWins: -1 };
                title = '🏆 Wins Leaderboard';
                emoji = '🏆';
                break;
            default:
                sortField = { credits: -1 };
                title = '💰 Credits Leaderboard';
                emoji = '💰';
        }

        const users = await User.find({ guildId: interaction.guild.id })
            .sort(sortField)
            .limit(10);

        if (users.length === 0) {
            return interaction.editReply({
                content: '❌ No users found on this server!',
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(title)
            .setDescription(`Top 10 users in **${interaction.guild.name}**`)
            .setTimestamp();

        let description = '';
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const discordUser = await interaction.client.users.fetch(user.userId).catch(() => null);
            const username = discordUser ? discordUser.username : 'Unknown User';

            let medal = '';
            if (i === 0) medal = '🥇';
            else if (i === 1) medal = '🥈';
            else if (i === 2) medal = '🥉';
            else medal = `**${i + 1}.**`;

            let value;
            switch (type) {
                case 'level':
                    value = `Level ${user.level} (${user.xp} XP)`;
                    break;
                case 'wins':
                    value = `${user.totalWins} wins`;
                    break;
                default:
                    value = `${user.credits.toLocaleString()} credits`;
            }

            description += `${medal} **${username}** - ${value}\n`;
        }

        embed.setDescription(description);

        await interaction.editReply({ embeds: [embed] });
    },
};
