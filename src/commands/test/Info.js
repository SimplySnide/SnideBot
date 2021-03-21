const { DiscordAPIError, MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
//const open = require('open');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = class Info extends BaseCommand {
  constructor() {
    super('info', 'information', ['information','guide','help']);
  }
  
  async run(client, message, args) {
    const commandList = 
    [ '\n **!nightfall** - Displays current nightfall information, (Usage : !nightfall)', 
      '\n **!nightfall [*strike* ]**  - Displays selected nightfall, (Usage : !nightfall LakeOfShadows)',
      '\n **!clear [*amount* ]**  - Deletes messages , (Usage : !clear 10)',
      '\n **!activity [*value* ]**  - Search destiny 2 activites , (Usage : !activity last wish)'
    ];
    var commandString = ""
    for (const command of commandList) {
      commandString = commandString + command;
    }
    const newEmbed = new MessageEmbed()
    newEmbed.setColor('#477ba9')
    newEmbed.setTitle('Snide Bot Information'),
    newEmbed.addFields(
       {name: 'Commands:', value: commandString}),
    newEmbed.setFooter('\'Snide Bot created by SimplySnide\'');
    
    message.author.send(newEmbed);

  }
}