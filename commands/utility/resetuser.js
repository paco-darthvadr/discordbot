const { SlashCommandBuilder } = require('discord.js');
const { checkDiscordUserExists, deleteDiscordUser } = require("../../utils/database.js");
const { adminRoleId, modRoleId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('reset users QR code')
		.addStringOption(option => option.setName('id').setDescription('Discord Users ID').setRequired(true)),
	async execute(interaction) {

        const member = interaction.member;

        if(!member.roles.cache.has(adminRoleId) && !member.roles.cache.has(modRoleId)){
            return interaction.reply({ content: 'You dont have permission for this command' })
        }
		const {value} = interaction.options.get('id');
		console.log("user to delete: ", value);

		if (checkDiscordUserExists(value)) {
			deleteDiscordUser(value);
			return await interaction.reply({ content: "Deleted user:" + value,  ephemeral: true });
		}
		return await interaction.reply({ content: "User not found: " + value,  ephemeral: true });
	},
};

