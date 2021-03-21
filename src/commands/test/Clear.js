const { DiscordAPIError, MessageEmbed, Message, Guild, User } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class Clear extends BaseCommand {
  constructor() {
    super('clear', 'information', ['purge','delete']);
  }
  
  async run(client, message, args) {
      
        if(message.member.hasPermission('MANAGE_MESSAGES'))
        {

            const maxMessageDelete = 100000000;
            if(Number(String(message).split(" ")[1]) + 1 > maxMessageDelete)
            {
                messageAmount = maxMessageDelete;
            }
            else
            {
                var messageAmount = Number(String(message).split(" ")[1]) + 1;
            }
            if(!isNaN(messageAmount) && messageAmount)
            {

                if(!message.guild.me.permissionsIn(message.channel).has('MANAGE_MESSAGES'))
                {
                    message.channel.send('Invalid Permission : Please allow me to \'Manage Messages\' in this channel.');            
                }
                else
                {
                    if(messageAmount>100)
                    {
                        for (let index = 0; index < messageAmount / 100; index++) {
                            message.channel.bulkDelete(100);            
                        }
                    }
                    else
                    {   
                        message.channel.bulkDelete(messageAmount);            
                    }
                }
            }
            else
            {
                message.channel.send('Invalid Command : Please enter a number')
            }
    
        }else
        {
            message.author.send('Invalid Permission : You do not have access to this command')

        }
    }
}