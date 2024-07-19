const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleId, guildId, adminRoleId, modRoleId } = require('../../config.json');
const { deleteDiscordUser, setDiscordUsers } = require('../../utils/database')
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
        const member = interaction.member;

        if(!member.roles.cache.has(adminRoleId) && !member.roles.cache.has(modRoleId)){
            return interaction.reply({ content: 'You dont have permission for this command' })
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

                setDiscordUsers(targetUser.id, {
                    verified: false,
                    username: member.user.username,
                    discrminator: member.user.discrminator,
                    unverifiedBy: interaction.user.id,
                    timestamp: new Date().toISOString(),
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