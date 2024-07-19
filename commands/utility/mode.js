const { SlashCommandBuilder  } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {adminRoleId, modRoleId } = require('../../config.json');
const config = require('../../config.json')

require('dotenv').config();



module.exports = {
	data: new SlashCommandBuilder()
	  .setName('maintenance')
	  .setDescription('Change maintenance mode')
	  .addBooleanOption(option =>
		option.setName('status')
	  .setDescription('Maintenance mode status')
	  .setRequired(true)),
	async execute(interaction) {
	  try {
        const member = interaction.member;

        if(!member.roles.cache.has(adminRoleId) && !member.roles.cache.has(modRoleId)){
            return interaction.reply({ content: 'You dont have permission for this command' })
        }

		const status = interaction.options.getBoolean('status');

		config.maintenance = status;

		fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(config, null, 2))

		await interaction.reply({ content: `Maintenance mode is ${status ? 'enabled' : 'disabled'}.`, ephemeral: true });
  
	  } catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
	  }
	},
  };