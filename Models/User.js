const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        default: 1000, // Starting credits
    },
    level: {
        type: Number,
        default: 1,
    },
    xp: {
        type: Number,
        default: 0,
    },
    lastDaily: {
        type: Date,
        default: null,
    },
    lastMessage: {
        type: Date,
        default: null,
    },
    totalWins: {
        type: Number,
        default: 0,
    },
    totalLosses: {
        type: Number,
        default: 0,
    },
    totalGamesPlayed: {
        type: Number,
        default: 0,
    },
    totalCreditsWon: {
        type: Number,
        default: 0,
    },
    totalCreditsLost: {
        type: Number,
        default: 0,
    },
    totalLoans: {
        type: Number,
        default: 0,
    },
    totalLoanAmount: {
        type: Number,
        default: 0,
    },
    lastLoan: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Compound index for faster lookups
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

// Calculate XP needed for next level
userSchema.methods.getXPForNextLevel = function() {
    return Math.floor(100 * Math.pow(this.level, 1.5));
};

// Add XP and handle level ups
userSchema.methods.addXP = function(amount) {
    this.xp += amount;
    let leveled = false;

    while (this.xp >= this.getXPForNextLevel()) {
        this.xp -= this.getXPForNextLevel();
        this.level += 1;
        leveled = true;
    }

    return leveled;
};

module.exports = model('User', userSchema);
