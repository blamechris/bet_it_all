const { EmbedBuilder } = require('discord.js');
const { getUser, getGuild } = require('../../Functions/database');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) return;

        try {
            const user = await getUser(message.author.id, message.guild.id);
            const guild = await getGuild(message.guild.id, message.guild.name);

            const now = new Date();
            const lastMessage = user.lastMessage;

            // Check XP cooldown
            if (lastMessage) {
                const timeSince = (now - lastMessage) / 1000; // in seconds
                if (timeSince < guild.settings.xpCooldown) {
                    return; // Still on cooldown
                }
            }

            // Add random XP (between 50% and 100% of configured amount)
            const baseXP = guild.settings.xpPerMessage;
            const randomXP = Math.floor(baseXP * (0.5 + Math.random() * 0.5));

            user.lastMessage = now;
            const leveledUp = user.addXP(randomXP);

            if (leveledUp) {
                // Give bonus credits on level up
                const bonusCredits = user.level * 100;
                user.credits += bonusCredits;

                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 Level Up!')
                    .setDescription(`**${message.author.username}** reached level **${user.level}**!`)
                    .addFields(
                        { name: '💰 Bonus Credits', value: `+${bonusCredits.toLocaleString()}`, inline: true },
                        { name: '📊 New Balance', value: `${user.credits.toLocaleString()}`, inline: true }
                    )
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });
            }

            await user.save();
        } catch (error) {
            console.error('Error in messageCreate event:', error);
        }
    },
};
