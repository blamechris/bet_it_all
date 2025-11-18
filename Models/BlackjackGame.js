const { Schema, model } = require('mongoose');

const playerSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    hand: [{
        type: String, // e.g., "A♠", "K♥"
    }],
    bet: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['playing', 'stand', 'bust', 'blackjack', 'won', 'lost', 'push'],
        default: 'playing',
    },
    handValue: {
        type: Number,
        default: 0,
    },
}, { _id: false });

const blackjackGameSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    messageId: {
        type: String,
        default: null,
    },
    hostId: {
        type: String,
        required: true,
    },
    players: [playerSchema],
    dealerHand: [{
        type: String,
    }],
    dealerHandValue: {
        type: Number,
        default: 0,
    },
    deck: [{
        type: String,
    }],
    currentPlayerIndex: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['waiting', 'betting', 'playing', 'finished'],
        default: 'waiting',
    },
    startTime: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

blackjackGameSchema.index({ guildId: 1, channelId: 1 });

module.exports = model('BlackjackGame', blackjackGameSchema);
