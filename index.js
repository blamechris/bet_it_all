const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, MessageContent],
    partials: [User, Message, GuildMember, ThreadMember]
});

const { loadEvents } = require("./Handlers/eventHandler");
const { connectDatabase } = require("./Functions/database");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();

// Connect to database
connectDatabase(client.config.mongoUri);

loadEvents(client);

client.login(client.config.token);
