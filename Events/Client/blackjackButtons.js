const BlackjackGame = require('../../Models/BlackjackGame');
const { getUser } = require('../../Functions/database');
const {
    createGameEmbed,
    createGameButtons,
    calculateHandValue,
    isBlackjack,
} = require('../../Functions/blackjack');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const customId = interaction.customId;

        if (!customId.startsWith('blackjack_')) return;

        const game = await BlackjackGame.findOne({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            status: { $in: ['waiting', 'playing'] },
        });

        if (!game) {
            return interaction.reply({
                content: '❌ No active game found!',
                ephemeral: true,
            });
        }

        if (customId === 'blackjack_join') {
            await handleJoin(interaction, game, client);
        } else if (customId === 'blackjack_start') {
            await handleStart(interaction, game, client);
        } else if (customId === 'blackjack_cancel') {
            await handleCancel(interaction, game, client);
        } else if (customId === 'blackjack_hit') {
            await handleHit(interaction, game, client);
        } else if (customId === 'blackjack_stand') {
            await handleStand(interaction, game, client);
        }
    },
};

async function handleJoin(interaction, game, client) {
    if (game.status !== 'waiting') {
        return interaction.reply({
            content: '❌ The game has already started!',
            ephemeral: true,
        });
    }

    // Check if already in game
    if (game.players.some(p => p.userId === interaction.user.id)) {
        return interaction.reply({
            content: '❌ You are already in this game!',
            ephemeral: true,
        });
    }

    // Get the host's bet amount (all players must bet the same)
    const hostBet = game.players[0].bet;

    const user = await getUser(interaction.user.id, interaction.guild.id);

    if (user.credits < hostBet) {
        return interaction.reply({
            content: `❌ You need **${hostBet.toLocaleString()}** credits to join! You have **${user.credits.toLocaleString()}**.`,
            ephemeral: true,
        });
    }

    // Add player to game
    game.players.push({
        userId: interaction.user.id,
        bet: hostBet,
        hand: [],
        status: 'playing',
        handValue: 0,
    });

    // Deduct bet from user
    user.credits -= hostBet;
    await user.save();
    await game.save();

    const embed = createGameEmbed(game, client);
    const buttons = createGameButtons(game);

    await interaction.update({
        embeds: [embed],
        components: [buttons],
    });

    await interaction.followUp({
        content: `✅ <@${interaction.user.id}> joined the game with a bet of **${hostBet.toLocaleString()}** credits!`,
    });
}

async function handleStart(interaction, game, client) {
    if (interaction.user.id !== game.hostId) {
        return interaction.reply({
            content: '❌ Only the host can start the game!',
            ephemeral: true,
        });
    }

    if (game.players.length === 0) {
        return interaction.reply({
            content: '❌ No players in the game!',
            ephemeral: true,
        });
    }

    // Deal initial cards
    game.status = 'playing';
    game.startTime = new Date();

    // Deal 2 cards to each player
    for (let player of game.players) {
        player.hand.push(game.deck.pop());
        player.hand.push(game.deck.pop());
        player.handValue = calculateHandValue(player.hand);

        // Check for blackjack
        if (isBlackjack(player.hand)) {
            player.status = 'blackjack';
        }
    }

    // Deal 2 cards to dealer
    game.dealerHand.push(game.deck.pop());
    game.dealerHand.push(game.deck.pop());
    game.dealerHandValue = calculateHandValue(game.dealerHand);

    game.currentPlayerIndex = 0;

    // Skip players with blackjack
    while (
        game.currentPlayerIndex < game.players.length &&
        game.players[game.currentPlayerIndex].status === 'blackjack'
    ) {
        game.currentPlayerIndex++;
    }

    await game.save();

    // Check if all players have blackjack
    if (game.currentPlayerIndex >= game.players.length) {
        await finishGame(game, interaction, client);
        return;
    }

    const embed = createGameEmbed(game, client);
    const buttons = createGameButtons(game);

    await interaction.update({
        embeds: [embed],
        components: [buttons],
    });
}

async function handleCancel(interaction, game, client) {
    if (interaction.user.id !== game.hostId) {
        return interaction.reply({
            content: '❌ Only the host can cancel the game!',
            ephemeral: true,
        });
    }

    // Refund all players
    for (const player of game.players) {
        const user = await getUser(player.userId, interaction.guild.id);
        user.credits += player.bet;
        await user.save();
    }

    await BlackjackGame.deleteOne({ _id: game._id });

    await interaction.update({
        content: '❌ Game cancelled! All bets have been refunded.',
        embeds: [],
        components: [],
    });
}

async function handleHit(interaction, game, client) {
    if (game.status !== 'playing') {
        return interaction.reply({
            content: '❌ The game is not in progress!',
            ephemeral: true,
        });
    }

    const currentPlayer = game.players[game.currentPlayerIndex];

    if (interaction.user.id !== currentPlayer.userId) {
        return interaction.reply({
            content: '❌ It\'s not your turn!',
            ephemeral: true,
        });
    }

    // Deal card
    const card = game.deck.pop();
    currentPlayer.hand.push(card);
    currentPlayer.handValue = calculateHandValue(currentPlayer.hand);

    // Check for bust
    if (currentPlayer.handValue > 21) {
        currentPlayer.status = 'bust';
        game.currentPlayerIndex++;
    }

    await game.save();

    // Move to next player or finish game
    await nextPlayerOrFinish(game, interaction, client);
}

async function handleStand(interaction, game, client) {
    if (game.status !== 'playing') {
        return interaction.reply({
            content: '❌ The game is not in progress!',
            ephemeral: true,
        });
    }

    const currentPlayer = game.players[game.currentPlayerIndex];

    if (interaction.user.id !== currentPlayer.userId) {
        return interaction.reply({
            content: '❌ It\'s not your turn!',
            ephemeral: true,
        });
    }

    currentPlayer.status = 'stand';
    game.currentPlayerIndex++;

    await game.save();

    await nextPlayerOrFinish(game, interaction, client);
}

async function nextPlayerOrFinish(game, interaction, client) {
    // Skip players who are bust or have blackjack
    while (
        game.currentPlayerIndex < game.players.length &&
        ['bust', 'blackjack', 'stand'].includes(game.players[game.currentPlayerIndex].status)
    ) {
        game.currentPlayerIndex++;
    }

    await game.save();

    // Check if all players are done
    if (game.currentPlayerIndex >= game.players.length) {
        await finishGame(game, interaction, client);
    } else {
        const embed = createGameEmbed(game, client);
        const buttons = createGameButtons(game);

        await interaction.update({
            embeds: [embed],
            components: [buttons],
        });
    }
}

async function finishGame(game, interaction, client) {
    game.status = 'finished';

    // Dealer plays
    while (game.dealerHandValue < 17) {
        game.dealerHand.push(game.deck.pop());
        game.dealerHandValue = calculateHandValue(game.dealerHand);
    }

    const dealerBust = game.dealerHandValue > 21;
    const dealerBlackjack = isBlackjack(game.dealerHand);

    // Determine winners and pay out
    for (const player of game.players) {
        const user = await getUser(player.userId, interaction.guild.id);

        if (player.status === 'bust') {
            player.status = 'lost';
            user.totalLosses++;
            user.totalCreditsLost += player.bet;
        } else if (player.status === 'blackjack') {
            if (dealerBlackjack) {
                player.status = 'push';
                user.credits += player.bet; // Refund
            } else {
                player.status = 'won';
                const winnings = Math.floor(player.bet * 2.5); // 3:2 payout
                user.credits += winnings;
                user.totalWins++;
                user.totalCreditsWon += winnings - player.bet;
            }
        } else {
            // Player stood
            if (dealerBust) {
                player.status = 'won';
                const winnings = player.bet * 2;
                user.credits += winnings;
                user.totalWins++;
                user.totalCreditsWon += player.bet;
            } else if (player.handValue > game.dealerHandValue) {
                player.status = 'won';
                const winnings = player.bet * 2;
                user.credits += winnings;
                user.totalWins++;
                user.totalCreditsWon += player.bet;
            } else if (player.handValue === game.dealerHandValue) {
                player.status = 'push';
                user.credits += player.bet; // Refund
            } else {
                player.status = 'lost';
                user.totalLosses++;
                user.totalCreditsLost += player.bet;
            }
        }

        user.totalGamesPlayed++;

        // Award XP for playing
        const xpGained = 50 + (player.status === 'won' ? 25 : 0);
        user.addXP(xpGained);

        await user.save();
    }

    await game.save();

    const embed = createGameEmbed(game, client, true);

    await interaction.update({
        embeds: [embed],
        components: [],
    });

    // Delete game after 30 seconds
    setTimeout(async () => {
        await BlackjackGame.deleteOne({ _id: game._id });
    }, 30000);
}
