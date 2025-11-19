const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ChickenGame = require('../Models/ChickenGame');
const { getUser } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chicken')
        .setDescription('Challenge someone to a game of chicken!')
        .addUserOption(option =>
            option
                .setName('opponent')
                .setDescription('The user to challenge')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('bet')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(100)
        ),
    async execute(interaction) {
        const opponent = interaction.options.getUser('opponent');
        const bet = interaction.options.getInteger('bet');
        const challenger = interaction.user;

        // Check if bot has permission to timeout members
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                content: '❌ I need the "Moderate Members" permission to run chicken games!',
                ephemeral: true,
            });
        }

        // Validation checks
        if (opponent.id === challenger.id) {
            return interaction.reply({
                content: '❌ You cannot challenge yourself!',
                ephemeral: true,
            });
        }

        if (opponent.bot) {
            return interaction.reply({
                content: '❌ You cannot challenge bots!',
                ephemeral: true,
            });
        }

        // Check if this is a response to an existing game
        const existingGame = await ChickenGame.findOne({
            guildId: interaction.guild.id,
            currentLoser: challenger.id,
            status: 'active',
        });

        if (existingGame) {
            // This is a response to a chicken challenge!
            if (opponent.id !== getOpponentId(existingGame, challenger.id)) {
                return interaction.reply({
                    content: '❌ You must tag your opponent when responding to a chicken challenge!',
                    ephemeral: true,
                });
            }

            // They chickened back! Escalate the game
            await escalateChickenGame(interaction, existingGame);
            return;
        }

        // Check if either user is already in an active game
        const userInGame = await ChickenGame.findOne({
            guildId: interaction.guild.id,
            $or: [
                { 'player1.userId': challenger.id, status: 'active' },
                { 'player2.userId': challenger.id, status: 'active' },
                { 'player1.userId': opponent.id, status: 'active' },
                { 'player2.userId': opponent.id, status: 'active' },
            ],
        });

        if (userInGame) {
            return interaction.reply({
                content: '❌ One of you is already in an active chicken game!',
                ephemeral: true,
            });
        }

        // Get both users' credits
        const challengerUser = await getUser(challenger.id, interaction.guild.id);
        const opponentUser = await getUser(opponent.id, interaction.guild.id);

        if (challengerUser.credits < bet) {
            return interaction.reply({
                content: `❌ You don't have enough credits! You have **${challengerUser.credits.toLocaleString()}** credits.`,
                ephemeral: true,
            });
        }

        if (opponentUser.credits < bet) {
            return interaction.reply({
                content: `❌ ${opponent.username} doesn't have enough credits! They have **${opponentUser.credits.toLocaleString()}** credits.`,
                ephemeral: true,
            });
        }

        // Check if both users can be muted
        const challengerMember = await interaction.guild.members.fetch(challenger.id);
        const opponentMember = await interaction.guild.members.fetch(opponent.id);

        if (!canMuteMember(interaction.guild, challengerMember) || !canMuteMember(interaction.guild, opponentMember)) {
            return interaction.reply({
                content: '❌ I cannot mute one or both of the players (server owner or role hierarchy issue)!',
                ephemeral: true,
            });
        }

        // Deduct bets from both users
        challengerUser.credits -= bet;
        opponentUser.credits -= bet;
        await challengerUser.save();
        await opponentUser.save();

        // Determine who has the lower bet (they go first as the "loser")
        // Since bets are equal in this command, randomly choose
        const loser = Math.random() < 0.5 ? challenger.id : opponent.id;

        // Create the game
        const game = await ChickenGame.create({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            player1: {
                userId: challenger.id,
                bet: bet,
            },
            player2: {
                userId: opponent.id,
                bet: bet,
            },
            currentRound: 1,
            currentMuteDuration: 5,
            currentLoser: loser,
            potAmount: bet * 2,
            status: 'active',
        });

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🐔 CHICKEN CHALLENGE!')
            .setDescription(
                `**${challenger.username}** challenged **${opponent.username}** to a game of chicken!\n\n` +
                `💰 **Pot:** ${game.potAmount.toLocaleString()} credits\n` +
                `⏱️ **Current Stakes:** ${game.currentMuteDuration} minute mute\n\n` +
                `🎯 **<@${game.currentLoser}> must respond!**\n` +
                `Use \`/chicken @opponent\` to challenge back, or say ANYTHING else to get muted and lose!`
            )
            .addFields(
                { name: `${challenger.username}'s Bet`, value: `${bet.toLocaleString()} credits`, inline: true },
                { name: `${opponent.username}'s Bet`, value: `${bet.toLocaleString()} credits`, inline: true },
                { name: 'Round', value: `${game.currentRound}`, inline: true }
            )
            .setFooter({ text: 'Will they chicken out? 🐔' })
            .setTimestamp();

        const message = await interaction.reply({
            embeds: [embed],
            fetchReply: true,
        });

        game.messageId = message.id;
        await game.save();
    },
};

function getOpponentId(game, userId) {
    return game.player1.userId === userId ? game.player2.userId : game.player1.userId;
}

function canMuteMember(guild, member) {
    if (member.id === guild.ownerId) return false;
    if (member.roles.highest.position >= guild.members.me.roles.highest.position) return false;
    return true;
}

async function escalateChickenGame(interaction, game) {
    const challenger = interaction.user;
    const opponentId = getOpponentId(game, challenger.id);

    // Update game state
    game.currentRound += 1;
    game.currentMuteDuration *= 2;

    // Cap at 1 day (1440 minutes)
    if (game.currentMuteDuration > 1440) {
        game.currentMuteDuration = 1440;
    }

    // Determine new loser (randomly since they both chickened)
    game.currentLoser = Math.random() < 0.5 ? challenger.id : opponentId;
    game.lastActionTime = new Date();

    await game.save();

    const opponent = await interaction.client.users.fetch(opponentId);

    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🐔 CHICKEN ESCALATES!')
        .setDescription(
            `**${challenger.username}** didn't back down!\n\n` +
            `💰 **Pot:** ${game.potAmount.toLocaleString()} credits\n` +
            `⏱️ **NEW STAKES:** ${game.currentMuteDuration} minute mute!\n` +
            `🔥 **Round:** ${game.currentRound}\n\n` +
            `🎯 **<@${game.currentLoser}> must respond!**\n` +
            `Use \`/chicken @opponent\` to challenge back, or say ANYTHING else to get muted and lose!`
        )
        .addFields(
            { name: 'Current Round', value: `${game.currentRound}`, inline: true },
            { name: 'Mute Duration', value: `${game.currentMuteDuration} minutes`, inline: true },
            { name: 'Pot', value: `${game.potAmount.toLocaleString()} credits`, inline: true }
        )
        .setFooter({ text: 'The stakes are rising! 🔥' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
