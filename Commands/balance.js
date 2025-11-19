const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your credits and level')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check (leave empty for yourself)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;

        const user = await getUser(target.id, interaction.guild.id);

        const xpNeeded = user.getXPForNextLevel();
        const xpProgress = ((user.xp / xpNeeded) * 100).toFixed(1);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${target.username}'s Profile`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '💰 Credits', value: `${user.credits.toLocaleString()}`, inline: true },
                { name: '📊 Level', value: `${user.level}`, inline: true },
                { name: '⭐ XP', value: `${user.xp}/${xpNeeded} (${xpProgress}%)`, inline: true },
                { name: '🎮 Games Played', value: `${user.totalGamesPlayed}`, inline: true },
                { name: '🏆 Wins', value: `${user.totalWins}`, inline: true },
                { name: '💔 Losses', value: `${user.totalLosses}`, inline: true },
            )
            .setTimestamp();

        if (user.totalGamesPlayed > 0) {
            const winRate = ((user.totalWins / user.totalGamesPlayed) * 100).toFixed(1);
            embed.addFields({ name: '📈 Win Rate', value: `${winRate}%`, inline: true });
        }

        if (user.totalLoans > 0) {
            embed.addFields(
                { name: '💵 Total Loans', value: `${user.totalLoans}`, inline: true },
                { name: '💸 Total Borrowed', value: `${user.totalLoanAmount.toLocaleString()}`, inline: true }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};
