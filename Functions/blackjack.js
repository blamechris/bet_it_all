const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push(`${value}${suit}`);
        }
    }
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getCardValue(card) {
    const value = card.slice(0, -1); // Remove suit
    if (value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(value)) return 10;
    return parseInt(value);
}

function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        const cardValue = getCardValue(card);
        value += cardValue;
        if (card.startsWith('A')) aces++;
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

function isBlackjack(hand) {
    return hand.length === 2 && calculateHandValue(hand) === 21;
}

function formatHand(hand, hideFirst = false) {
    if (hideFirst && hand.length > 0) {
        return `🂠 ${hand.slice(1).join(' ')}`;
    }
    return hand.join(' ');
}

function createGameEmbed(game, client, showDealerHand = false, gifUrl = null) {
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎰 Multiplayer Blackjack')
        .setTimestamp();

    // Dealer's hand
    const dealerHand = showDealerHand
        ? formatHand(game.dealerHand)
        : formatHand(game.dealerHand, true);

    const dealerValue = showDealerHand
        ? `(${game.dealerHandValue})`
        : `(${calculateHandValue([game.dealerHand[1]])})`;

    embed.addFields({
        name: '🎩 Dealer',
        value: `${dealerHand} ${dealerValue}`,
        inline: false,
    });

    // Players' hands
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        const isCurrentPlayer = i === game.currentPlayerIndex && game.status === 'playing';

        let statusEmoji = '';
        switch (player.status) {
            case 'playing':
                statusEmoji = isCurrentPlayer ? '▶️' : '⏸️';
                break;
            case 'stand':
                statusEmoji = '🛑';
                break;
            case 'bust':
                statusEmoji = '💥';
                break;
            case 'blackjack':
                statusEmoji = '🎉';
                break;
            case 'won':
                statusEmoji = '🏆';
                break;
            case 'lost':
                statusEmoji = '❌';
                break;
            case 'push':
                statusEmoji = '🤝';
                break;
        }

        const hand = formatHand(player.hand);
        const handValue = player.handValue;

        embed.addFields({
            name: `${statusEmoji} <@${player.userId}> - Bet: ${player.bet.toLocaleString()}`,
            value: `${hand} (${handValue})`,
            inline: false,
        });
    }

    // Game status
    if (game.status === 'waiting') {
        embed.setDescription('**Waiting for players to join...**\nClick "Join Game" to participate!');
    } else if (game.status === 'playing') {
        const currentPlayer = game.players[game.currentPlayerIndex];
        embed.setDescription(`**<@${currentPlayer.userId}>'s turn**\nHit or Stand?`);
    } else if (game.status === 'finished') {
        embed.setDescription('**Game Over!**');
    }

    // Add GIF if provided
    if (gifUrl) {
        embed.setImage(gifUrl);
    }

    return embed;
}

function createGameButtons(game) {
    if (game.status === 'waiting') {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('blackjack_join')
                    .setLabel('Join Game')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('blackjack_start')
                    .setLabel('Start Game')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️'),
                new ButtonBuilder()
                    .setCustomId('blackjack_cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );
    } else if (game.status === 'playing') {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('blackjack_hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🃏'),
                new ButtonBuilder()
                    .setCustomId('blackjack_stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛑')
            );
    }

    return null;
}

module.exports = {
    createDeck,
    shuffleDeck,
    getCardValue,
    calculateHandValue,
    isBlackjack,
    formatHand,
    createGameEmbed,
    createGameButtons,
};
