const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleId, guildId } = require('../../config.json');
const { deleteDiscordUser } = require('../../utils/database')
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unverify')
        .setDescription('Remove the verified role from a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to unverify')
                .setRequired(true)),
    async execute(interaction) {
        // Change to owner or whatever required
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('target');
        const guild = interaction.client.guilds.cache.get(guildId);

        if (!guild) {
            return interaction.reply({ content: 'Guild not found.', ephemeral: true });
        }

        try {
            const member = await guild.members.fetch(targetUser.id);
            const role = guild.roles.cache.get(roleId);

            if (!role) {
                return interaction.reply({ content: 'Role not found.', ephemeral: true });
            }

            
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(role);
                await member.send("Your verified role has been removed.");

                deleteDiscordUser(targetUser.id)

                const logEntry = {
                    userId: targetUser.id,
                    username: targetUser.tag,
                    timestamp: new Date().toISOString(),
                    removedBy: interaction.user.tag,
                };
                const logFilePath = path.join(__dirname, '../logs/unverified_users.json');


                if (!fs.existsSync(path.join(__dirname, '../logs'))) {
                    fs.mkdirSync(path.join(__dirname, '../logs'));
                }

                fs.readFile(logFilePath, 'utf8', (err, data) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error('Error reading log file:', err);
                    } else {
                        const logs = data ? JSON.parse(data) : [];
                        logs.push(logEntry);
                        fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), err => {
                            if (err) {
                                console.error('Error writing log file:', err);
                            }
                        });
                    }
                });

                return interaction.reply({ content: `Successfully removed the verified role from ${targetUser.tag}.`, ephemeral: true });
            } else {
                return interaction.reply({ content: `${targetUser.tag} does not have the verified role.`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error trying to unverify this user.', ephemeral: true });
        }
    },
};