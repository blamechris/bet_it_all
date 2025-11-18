const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    settings: {
        dailyCredits: {
            type: Number,
            default: 500,
        },
        xpPerMessage: {
            type: Number,
            default: 15,
        },
        xpCooldown: {
            type: Number,
            default: 60, // seconds between XP gains
        },
        minBet: {
            type: Number,
            default: 10,
        },
        maxBet: {
            type: Number,
            default: 10000,
        },
        muteCreditsPerMinute: {
            type: Number,
            default: 1000, // 1000 credits = 1 minute mute
        },
    },
}, {
    timestamps: true,
});

module.exports = model('Guild', guildSchema);
