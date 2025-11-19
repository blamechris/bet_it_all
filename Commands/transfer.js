const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../Functions/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer credits to another user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to transfer credits to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of credits to transfer')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot transfer credits to yourself!',
                ephemeral: true,
            });
        }

        if (target.bot) {
            return interaction.reply({
                content: '❌ You cannot transfer credits to bots!',
                ephemeral: true,
            });
        }

        const sender = await getUser(interaction.user.id, interaction.guild.id);

        if (sender.credits < amount) {
            return interaction.reply({
                content: `❌ You don't have enough credits! You have **${sender.credits.toLocaleString()}** credits.`,
                ephemeral: true,
            });
        }

        const receiver = await getUser(target.id, interaction.guild.id);

        sender.credits -= amount;
        receiver.credits += amount;

        await sender.save();
        await receiver.save();

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💸 Credits Transferred!')
            .setDescription(`**${interaction.user.username}** transferred **${amount.toLocaleString()}** credits to **${target.username}**`)
            .addFields(
                { name: 'Your Balance', value: `${sender.credits.toLocaleString()}`, inline: true },
                { name: 'Their Balance', value: `${receiver.credits.toLocaleString()}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
