const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { loadFiles } = require('../Functions/fileLoader');
const AsciiTable = require('ascii-table');

async function loadCommands(client) {
    const table = new AsciiTable('Commands Loaded');
    table.setHeading('Command', 'Status');

    const files = await loadFiles('Commands');

    const commands = [];

    for (const file of files) {
        try {
            const command = require(file);

            if (!command.data || !command.execute) {
                table.addRow(file.split('/').pop(), '❌ Missing data or execute');
                continue;
            }

            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());

            table.addRow(command.data.name, '✅');
        } catch (error) {
            table.addRow(file.split('/').pop(), '❌ Error');
            console.error(`Error loading ${file}:`, error);
        }
    }

    console.log(table.toString());

    // Register slash commands
    if (commands.length > 0) {
        const rest = new REST({ version: '10' }).setToken(client.config.token);

        try {
            console.log('Registering slash commands...');

            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );

            console.log('✓ Successfully registered slash commands');
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    }
}

module.exports = { loadCommands };
