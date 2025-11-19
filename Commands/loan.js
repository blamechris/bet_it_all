const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser, getGuild } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loan')
        .setDescription('Take out a loan (get credits in exchange for being muted)')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of credits to borrow')
                .setRequired(true)
                .setMinValue(1000)
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const member = interaction.member;

        // Check if bot has permission to timeout members
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                content: '❌ I don\'t have permission to timeout members! I need this permission to process loans.',
                ephemeral: true,
            });
        }

        // Check if user is mutable
        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: '❌ The server owner cannot take out loans!',
                ephemeral: true,
            });
        }

        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: '❌ I cannot mute you (you have a higher or equal role to me), so I cannot process your loan!',
                ephemeral: true,
            });
        }

        // Check if user is already muted
        if (member.communicationDisabledUntil && member.communicationDisabledUntil > new Date()) {
            return interaction.reply({
                content: '❌ You are already muted! Wait until your mute expires before taking another loan.',
                ephemeral: true,
            });
        }

        const user = await getUser(interaction.user.id, interaction.guild.id);
        const guild = await getGuild(interaction.guild.id, interaction.guild.name);

        // Check max loan amount
        if (amount > guild.settings.maxLoan) {
            return interaction.reply({
                content: `❌ Maximum loan amount is **${guild.settings.maxLoan.toLocaleString()}** credits!`,
                ephemeral: true,
            });
        }

        // Check loan cooldown
        if (user.lastLoan) {
            const now = new Date();
            const timeSince = (now - user.lastLoan) / (1000 * 60 * 60); // in hours
            const hoursUntilNext = guild.settings.loanCooldown - timeSince;

            if (hoursUntilNext > 0) {
                const hours = Math.floor(hoursUntilNext);
                const minutes = Math.floor((hoursUntilNext - hours) * 60);

                return interaction.reply({
                    content: `⏰ You already took out a loan recently! Come back in **${hours}h ${minutes}m**`,
                    ephemeral: true,
                });
            }
        }

        // Calculate mute duration
        const muteMinutes = Math.ceil(amount / guild.settings.muteCreditsPerMinute);
        const muteDuration = muteMinutes * 60 * 1000; // Convert to milliseconds

        // Check if mute duration exceeds Discord's limit (28 days)
        const maxMuteDuration = 28 * 24 * 60 * 60 * 1000; // 28 days in ms
        if (muteDuration > maxMuteDuration) {
            const maxLoanForMuteLimit = Math.floor((maxMuteDuration / (60 * 1000)) * guild.settings.muteCreditsPerMinute);
            return interaction.reply({
                content: `❌ Loan amount too high! The mute duration would exceed Discord's 28-day limit.\n💡 Maximum loan considering mute limit: **${maxLoanForMuteLimit.toLocaleString()}** credits`,
                ephemeral: true,
            });
        }

        // Process the loan
        user.credits += amount;
        user.totalLoans += 1;
        user.totalLoanAmount += amount;
        user.lastLoan = new Date();
        await user.save();

        // Mute the user
        await member.timeout(muteDuration, `Loan taken: ${amount.toLocaleString()} credits`);

        // Calculate when mute expires
        const muteExpires = new Date(Date.now() + muteDuration);
        const muteExpiresTimestamp = Math.floor(muteExpires.getTime() / 1000);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Loan Approved!')
            .setDescription(`**${interaction.user.username}** took out a loan of **${amount.toLocaleString()}** credits!`)
            .addFields(
                { name: '💵 Credits Received', value: `${amount.toLocaleString()}`, inline: true },
                { name: '🔇 Mute Duration', value: `${muteMinutes} minute(s)`, inline: true },
                { name: '💰 New Balance', value: `${user.credits.toLocaleString()}`, inline: true },
                { name: '⏰ Mute Expires', value: `<t:${muteExpiresTimestamp}:R>`, inline: false },
            )
            .setFooter({ text: `Rate: ${guild.settings.muteCreditsPerMinute.toLocaleString()} credits = 1 minute mute` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('💰 Loan Received!')
                .setDescription(`You received a loan of **${amount.toLocaleString()}** credits in **${interaction.guild.name}**!`)
                .addFields(
                    { name: '🔇 You are muted for', value: `${muteMinutes} minute(s)`, inline: true },
                    { name: '⏰ Mute expires', value: `<t:${muteExpiresTimestamp}:R>`, inline: true },
                    { name: '💰 New Balance', value: `${user.credits.toLocaleString()}`, inline: true },
                )
                .setFooter({ text: 'The mute is the cost of your loan. Spend wisely!' })
                .setTimestamp();

            await interaction.user.send({ embeds: [dmEmbed] });
        } catch (error) {
            // User has DMs disabled
        }
    },
};
