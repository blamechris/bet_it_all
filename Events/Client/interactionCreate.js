module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({
                content: 'This command no longer exists!',
                ephemeral: true,
            });
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error('Command error:', error);
            const errorMessage = {
                content: 'There was an error executing this command!',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
