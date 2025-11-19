const { SlashCommandBuilder } = require('discord.js');
const BlackjackGame = require('../Models/BlackjackGame');
const { getUser, getGuild } = require('../Functions/database');
const { createDeck, createGameEmbed, createGameButtons } = require('../Functions/blackjack');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Start a multiplayer blackjack game')
        .addIntegerOption(option =>
            option
                .setName('bet')
                .setDescription('Your bet amount')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');

        // Check if there's already a game in this channel
        const existingGame = await BlackjackGame.findOne({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            status: { $in: ['waiting', 'playing'] },
        });

        if (existingGame) {
            return interaction.reply({
                content: '❌ There is already a game in progress in this channel!',
                ephemeral: true,
            });
        }

        const user = await getUser(interaction.user.id, interaction.guild.id);
        const guild = await getGuild(interaction.guild.id, interaction.guild.name);

        // Validate bet amount
        if (bet < guild.settings.minBet) {
            return interaction.reply({
                content: `❌ Minimum bet is **${guild.settings.minBet.toLocaleString()}** credits!`,
                ephemeral: true,
            });
        }

        if (bet > guild.settings.maxBet) {
            return interaction.reply({
                content: `❌ Maximum bet is **${guild.settings.maxBet.toLocaleString()}** credits!`,
                ephemeral: true,
            });
        }

        if (user.credits < bet) {
            return interaction.reply({
                content: `❌ You don't have enough credits! You have **${user.credits.toLocaleString()}** credits.`,
                ephemeral: true,
            });
        }

        // Create the game
        const deck = createDeck();

        const game = await BlackjackGame.create({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            hostId: interaction.user.id,
            players: [{
                userId: interaction.user.id,
                bet: bet,
                hand: [],
                status: 'playing',
                handValue: 0,
            }],
            dealerHand: [],
            deck: deck,
            status: 'waiting',
        });

        // Deduct bet from user
        user.credits -= bet;
        await user.save();

        const embed = createGameEmbed(game, interaction.client);
        const buttons = createGameButtons(game);

        const message = await interaction.reply({
            embeds: [embed],
            components: [buttons],
            fetchReply: true,
        });

        game.messageId = message.id;
        await game.save();
    },
};
