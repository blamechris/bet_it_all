const mongoose = require('mongoose');

async function connectDatabase(uri) {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✓ Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('✗ MongoDB connection error:', error);
        return false;
    }
}

async function getUser(userId, guildId) {
    const User = require('../Models/User');

    let user = await User.findOne({ userId, guildId });

    if (!user) {
        user = await User.create({
            userId,
            guildId,
        });
    }

    return user;
}

async function getGuild(guildId, guildName) {
    const Guild = require('../Models/Guild');

    let guild = await Guild.findOne({ guildId });

    if (!guild) {
        guild = await Guild.create({
            guildId,
            name: guildName,
        });
    }

    return guild;
}

module.exports = {
    connectDatabase,
    getUser,
    getGuild,
};
