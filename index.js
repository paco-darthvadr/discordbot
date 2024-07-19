const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { roleId, guildId, token } = require('./config.json');
require('dotenv').config();
const express = require("express");
const { VerusIdInterface } = require('verusid-ts-client');
const { primitives } = require('verusid-ts-client');
const bodyParser = require('body-parser');
const { setDiscordUsers, setProcessedChallenges } = require('./utils/database')


const client = new Client({ presence: { status: "invisible" }, intents: [GatewayIntentBits.Guilds] });

const app = express();

const port = process.env.PORT || 3000;

const VERUS_RPC_NETWORK = process.env.TESTNET == 'true' ? process.env.TESTNET_VERUS_RPC_NETWORK : process.env.MAINNET_VERUS_RPC_NETWORK
const SYSTEM_ID = process.env.TESTNET == 'true' ? "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq" : "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV";


const VerusId = new VerusIdInterface(SYSTEM_ID, VERUS_RPC_NETWORK);

app.use(bodyParser.json());

app.post("/registerdiscorduser", async (req, res) => {
    try {

        const data = req.body;
        const usersDiscordId = req.query.id

        // Parse the LoginConsentResponse 
        const loginConsentResponse = new primitives.LoginConsentResponse(data);
        console.log('Login Consent Response:', loginConsentResponse);

		if(loginConsentResponse.decision.request.challenge.redirect_uris[0].uri.indexOf(usersDiscordId) == -1){
			throw new Error("Wrong userID for challenge")
		}

        const success = await VerusId.verifyLoginConsentResponse(loginConsentResponse);
 
        if (!success) {
            throw new Error("Signature does not match");
        }

        setProcessedChallenges(usersDiscordId, loginConsentResponse);
        console.log(`Saved Challenges for ${usersDiscordId}`)

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error("Guild not found");
        }

        const member = await guild.members.fetch(usersDiscordId);
        if (!member) {
            throw new Error("Member not found");
        }

        const role = guild.roles.cache.get(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        await member.roles.add(role);
        console.log(`Added role ${role.name} to user ${member.user.tag}`);

        await member.send("VerusID successfully verified your profile. You have been given the verified role!");

        setDiscordUsers(usersDiscordId, {
            verified: true,
            username: member.user.username,
            discrminator: member.user.discrminator,
            timestamp: new Date().toISOString(),
        });

        res.send(true);
    } catch (e) {
        console.error(e);
        res.status(500).send(false);
    }
});





client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	} 


	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
  });

client.login(token);
