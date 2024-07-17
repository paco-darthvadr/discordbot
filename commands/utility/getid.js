const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder  } = require('discord.js');
const { getdeeplink, getTinyUrl } = require("../../utils/getdeeplink.js")
const { checkDiscordUserExists, setDiscordUsers } = require("../../utils/database.js")
const wait = require('node:timers/promises').setTimeout;
const qr = require('qr-image');
const fs = require('fs');
require('dotenv').config();



module.exports = {
	data: new SlashCommandBuilder()
	  .setName('getid')
	  .setDescription('Get Verified'),
	async execute(interaction) {
	  try {
		const userid = interaction.user.id;
  
		if (checkDiscordUserExists(userid)) {
		  return await interaction.reply({ content: "You have already verified.", ephemeral: true });
		}
  
		await interaction.deferReply({ ephemeral: true });
  
		const deeplinkurl = await getdeeplink(userid);
		const tinyurl = await getTinyUrl(deeplinkurl);
  
		const qr_png = qr.image(deeplinkurl, { type: 'png' });
		const pngname = `${interaction.user.id}_qr_code.png`;
  
		await qr_png.pipe(fs.createWriteStream(`./public/${pngname}`));
		await wait(2000);
  
		const file = new AttachmentBuilder(`./public/${pngname}`);
  
		await interaction.editReply({
		  embeds: [templateEmbed(pngname, tinyurl)],
		  files: [file],
		});
  
		//setDiscordUsers(interaction.user.id);

		setDiscordUsers(interaction.user.id, {
            verified: true,
            username: interaction.user.username,
            discrminator: interaction.user.discrminator,
            verifiedAt: new Date().toISOString(),
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
	.setAuthor({ name: 'Verus', iconURL: 'https://cdn.discordapp.com/emojis/1239220413578350603.png', url: 'https://discord.com' })
	.setDescription('Please click on the link in a mobile device to open the Verus Mobile app, or scan the QR code to verify')
	.setThumbnail('https://cdn.discordapp.com/emojis/1239220413578350603.png')
	.setImage(`attachment://${pngname}`)
	.setTimestamp()
	.setFooter({ text: 'Sent from Verus', iconURL: 'https://cdn.discordapp.com/emojis/1239220413578350603.png' });
};

