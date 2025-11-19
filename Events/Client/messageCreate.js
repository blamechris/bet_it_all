const { EmbedBuilder } = require('discord.js');
const { getUser, getGuild } = require('../../Functions/database');
const ChickenGame = require('../../Models/ChickenGame');
const { getRandomGif, GIF_SEARCH_TERMS } = require('../../Functions/gif');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) return;

        try {
            // Check if user is in an active chicken game and is the current loser
            const chickenGame = await ChickenGame.findOne({
                guildId: message.guild.id,
                currentLoser: message.author.id,
                status: 'active',
            });

            if (chickenGame) {
                // User sent a message instead of using /chicken - they lose!
                await handleChickenLoss(message, chickenGame);
                return; // Don't process XP for this message
            }

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

async function handleChickenLoss(message, game) {
    try {
        const loser = message.author;
        const winnerId = game.player1.userId === loser.id ? game.player2.userId : game.player1.userId;
        const winner = await message.client.users.fetch(winnerId);

        // Award pot to winner
        const winnerUser = await getUser(winnerId, message.guild.id);
        winnerUser.credits += game.potAmount;
        await winnerUser.save();

        // Mute the loser
        const loserMember = await message.guild.members.fetch(loser.id);
        const muteDuration = game.currentMuteDuration * 60 * 1000; // Convert to milliseconds

        try {
            await loserMember.timeout(muteDuration, `Lost chicken game - Round ${game.currentRound}`);
        } catch (error) {
            console.error('Failed to mute loser:', error);
        }

        // Update game status
        game.status = 'finished';
        await game.save();

        // Get a random losing GIF
        const gifUrl = await getRandomGif(GIF_SEARCH_TERMS.chickenLose, message.client.config.tenorApiKey);

        // Announce the result
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🐔 CHICKEN OUT!')
            .setDescription(
                `**${loser.username}** chickened out by speaking!\n\n` +
                `🏆 **${winner.username}** wins **${game.potAmount.toLocaleString()}** credits!\n` +
                `🔇 **${loser.username}** is muted for **${game.currentMuteDuration} minutes**!`
            )
            .addFields(
                { name: 'Final Round', value: `${game.currentRound}`, inline: true },
                { name: 'Mute Duration', value: `${game.currentMuteDuration} minutes`, inline: true },
                { name: 'Winner Takes', value: `${game.potAmount.toLocaleString()} credits`, inline: true }
            )
            .setFooter({ text: `${loser.username} couldn't stay silent! 🐔` })
            .setTimestamp();

        // Add GIF if available
        if (gifUrl) {
            embed.setImage(gifUrl);
        }

        await message.channel.send({ embeds: [embed] });

        // Try to DM the loser
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🐔 You Lost the Chicken Game!')
                .setDescription(
                    `You chickened out in **${message.guild.name}**!\n\n` +
                    `You've been muted for **${game.currentMuteDuration} minutes**.\n` +
                    `**${winner.username}** won **${game.potAmount.toLocaleString()}** credits!`
                )
                .setFooter({ text: 'Should have used /chicken instead! 🐔' })
                .setTimestamp();

            await loser.send({ embeds: [dmEmbed] });
        } catch (error) {
            // User has DMs disabled
        }

        // Delete the game after 30 seconds
        setTimeout(async () => {
            await ChickenGame.deleteOne({ _id: game._id });
        }, 30000);

    } catch (error) {
        console.error('Error handling chicken loss:', error);
    }
}
