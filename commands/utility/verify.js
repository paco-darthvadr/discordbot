const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder  } = require('discord.js');
const { getverified, getVerifiedTinyUrl } = require("../../utils/getverified.js")
const { checkDiscordUserExists, setDiscordUsers, getDiscordUsers } = require("../../utils/database.js")
const wait = require('node:timers/promises').setTimeout;
const qr = require('qr-image');
const fs = require('fs');
require('dotenv').config();

const config = require('../../config.json');




module.exports = {
	data: new SlashCommandBuilder()
	  .setName('getverified')
	  .setDescription('Get Verified'),
	async execute(interaction) {
	  try {
		const userid = interaction.user.id;

		if(config.maintenance){
			return interaction.reply({ content: 'Bot is currently under maintenance. Please try later' })
		}
  
		if (checkDiscordUserExists(userid)) {
		  return await interaction.reply({ content: "You have already verified.", ephemeral: true });
		}
  
		await interaction.deferReply({ ephemeral: true });
  
		const deeplinkurl = await getverified(userid);
		const tinyurl = await getVerifiedTinyUrl(deeplinkurl);
  
		const qr_png = qr.image(deeplinkurl, { type: 'png' });
		const pngname = `${interaction.user.id}_qr_code.png`;
  
		await qr_png.pipe(fs.createWriteStream(`./public/${pngname}`));
		await wait(2000);
  
		const file = new AttachmentBuilder(`./public/${pngname}`);
  
		await interaction.editReply({
		  embeds: [templateEmbed(pngname, tinyurl)],
		  files: [file],
		});
  
	  } catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
	  }
	},
  };
  

  const templateEmbed = (pngname, tinylink) => {
	return new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Your Verus Verify Login Link')
	.setURL(tinylink)
	.setAuthor({ name: 'Verus', iconURL: 'https://cdn.discordapp.com/emojis/1239220413578350603.png', url: 'https://verus.io' })
	.setDescription('Please click on the link in a mobile device to open the Verus Mobile app, or scan the QR code to verify')
	.setThumbnail('https://cdn.discordapp.com/emojis/1239220413578350603.png')
	.setImage(`attachment://${pngname}`)
	.setTimestamp()
	.setFooter({ text: 'Sent from Verus', iconURL: 'https://cdn.discordapp.com/emojis/1239220413578350603.png' });
};

