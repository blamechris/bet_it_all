const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser, getGuild } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user by spending credits')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to mute')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('minutes')
                .setDescription('Number of minutes to mute (1000 credits per minute)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(60)
        ),
    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const minutes = interaction.options.getInteger('minutes');

        if (!target) {
            return interaction.reply({
                content: '❌ User not found in this server!',
                ephemeral: true,
            });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot mute yourself!',
                ephemeral: true,
            });
        }

        if (target.user.bot) {
            return interaction.reply({
                content: '❌ You cannot mute bots!',
                ephemeral: true,
            });
        }

        // Check if bot has permission to timeout members
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({
                content: '❌ I don\'t have permission to timeout members!',
                ephemeral: true,
            });
        }

        // Check if target is mutable (not owner, not higher role)
        if (target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: '❌ I cannot mute this user (they have a higher or equal role to me)!',
                ephemeral: true,
            });
        }

        if (target.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: '❌ You cannot mute the server owner!',
                ephemeral: true,
            });
        }

        const guild = await getGuild(interaction.guild.id, interaction.guild.name);
        const user = await getUser(interaction.user.id, interaction.guild.id);

        const creditsPerMinute = guild.settings.muteCreditsPerMinute;
        const totalCost = creditsPerMinute * minutes;

        if (user.credits < totalCost) {
            return interaction.reply({
                content: `❌ You need **${totalCost.toLocaleString()}** credits to mute for ${minutes} minute(s)! You have **${user.credits.toLocaleString()}** credits.\n💡 **Price:** ${creditsPerMinute.toLocaleString()} credits per minute`,
                ephemeral: true,
            });
        }

        // Deduct credits
        user.credits -= totalCost;
        await user.save();

        // Mute the user
        const muteDuration = minutes * 60 * 1000; // Convert to milliseconds
        await target.timeout(muteDuration, `Muted by ${interaction.user.tag} using ${totalCost.toLocaleString()} credits`);

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🔇 User Muted!')
            .setDescription(`**${target.user.username}** has been muted for **${minutes} minute(s)**`)
            .addFields(
                { name: 'Muted By', value: interaction.user.username, inline: true },
                { name: 'Cost', value: `${totalCost.toLocaleString()} credits`, inline: true },
                { name: 'Remaining Balance', value: `${user.credits.toLocaleString()} credits`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // DM the muted user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔇 You have been muted!')
                .setDescription(`You were muted in **${interaction.guild.name}** for **${minutes} minute(s)**`)
                .addFields(
                    { name: 'Muted By', value: interaction.user.username, inline: true },
                    { name: 'Cost', value: `${totalCost.toLocaleString()} credits`, inline: true },
                )
                .setFooter({ text: 'This mute was purchased with server credits' })
                .setTimestamp();

            await target.send({ embeds: [dmEmbed] });
        } catch (error) {
            // User has DMs disabled
        }
    },
};
