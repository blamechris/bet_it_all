const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, getGuild } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily credits'),
    async execute(interaction) {
        const user = await getUser(interaction.user.id, interaction.guild.id);
        const guild = await getGuild(interaction.guild.id, interaction.guild.name);

        const now = new Date();
        const lastDaily = user.lastDaily;

        if (lastDaily) {
            const timeSince = now - lastDaily;
            const hoursUntilNext = 24 - (timeSince / (1000 * 60 * 60));

            if (hoursUntilNext > 0) {
                const hours = Math.floor(hoursUntilNext);
                const minutes = Math.floor((hoursUntilNext - hours) * 60);

                return interaction.reply({
                    content: `⏰ You already claimed your daily credits! Come back in **${hours}h ${minutes}m**`,
                    ephemeral: true,
                });
            }
        }

        const dailyAmount = guild.settings.dailyCredits;
        const bonusAmount = Math.floor(user.level * 50); // Bonus based on level
        const totalAmount = dailyAmount + bonusAmount;

        user.credits += totalAmount;
        user.lastDaily = now;
        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Daily Credits Claimed!')
            .setDescription(`You received **${totalAmount.toLocaleString()}** credits!`)
            .addFields(
                { name: 'Base Amount', value: `${dailyAmount.toLocaleString()}`, inline: true },
                { name: 'Level Bonus', value: `${bonusAmount.toLocaleString()}`, inline: true },
                { name: 'New Balance', value: `${user.credits.toLocaleString()}`, inline: true },
            )
            .setFooter({ text: 'Come back in 24 hours for more!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
