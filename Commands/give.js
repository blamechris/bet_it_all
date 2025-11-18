const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give credits to a user (Admin only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to give credits to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of credits to give')
                .setRequired(true)
                .setMinValue(1)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (target.bot) {
            return interaction.reply({
                content: '❌ You cannot give credits to bots!',
                ephemeral: true,
            });
        }

        const user = await getUser(target.id, interaction.guild.id);
        user.credits += amount;
        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('💸 Credits Given!')
            .setDescription(`**${interaction.user.username}** gave **${amount.toLocaleString()}** credits to **${target.username}**`)
            .addFields(
                { name: 'New Balance', value: `${user.credits.toLocaleString()} credits`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
