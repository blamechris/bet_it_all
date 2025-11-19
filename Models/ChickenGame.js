const { Schema, model } = require('mongoose');

const chickenGameSchema = new Schema({
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
    player1: {
        userId: {
            type: String,
            required: true,
        },
        bet: {
            type: Number,
            required: true,
        },
    },
    player2: {
        userId: {
            type: String,
            required: true,
        },
        bet: {
            type: Number,
            required: true,
        },
    },
    currentRound: {
        type: Number,
        default: 1,
    },
    currentMuteDuration: {
        type: Number,
        default: 5, // Starting at 5 minutes
    },
    currentLoser: {
        type: String,
        required: true,
    },
    potAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting',
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    lastActionTime: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

chickenGameSchema.index({ guildId: 1, channelId: 1 });
chickenGameSchema.index({ status: 1 });

module.exports = model('ChickenGame', chickenGameSchema);
