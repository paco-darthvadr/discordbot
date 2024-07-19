const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleId, adminRoleId, modRoleId } = require('../../config.json');
const { getDiscordUsers } = require('../../utils/database')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check verified ')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Check user verification')
                .setRequired(false)),
    async execute(interaction) {
        // Change to owner or whatever required
        const member = interaction.member;

        if(!member.roles.cache.has(adminRoleId) && !member.roles.cache.has(modRoleId)){
            return interaction.reply({ content: 'You dont have permission for this command' })
        }
        try{

            const targetUser = interaction.options.getUser('target');

            const userId = targetUser ? targetUser.id : interaction.user.id;

            const discordUsers = getDiscordUsers();

            if(discordUsers[userId] && discordUsers[userId].verified) {
                await interaction.reply({ content: `${targetUser ? targetUser.tag : 'Is'} verified`, ephemeral: true });
            } else {
                await interaction.reply({ content: "Not verified", ephemeral: true });
            }
        } catch (error){
            console.error(error);
            await interaction.reply({ content: "There was as error while chexking", ephemeral: true });
        }


    },
};