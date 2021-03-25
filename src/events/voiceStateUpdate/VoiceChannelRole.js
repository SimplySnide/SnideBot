const BaseEvent = require('../../utils/structures/BaseEvent');
const { Client } = require('discord.js');
var Discord = require('discord.js');
var client = Discord.Client;
module.exports = class voiceStateUpdate extends BaseEvent {
  constructor() {
    super('voiceStateUpdate');
  }
  async run (client, previousChannelInfo, currentChannelInfo) 
  {

    const blockedChannelID = [781638511714762753];
    if(!blockedChannelID.includes(Number.parseInt(currentChannelInfo.channelID)))
    {

  //#region 
      const RoleColour = "DARK_green".toUpperCase();;
      //console.log(previousChannelInfo);

      const joinedUser = currentChannelInfo.id;
      if(currentChannelInfo.channelID == null) //Has left voice channel
      {
        client.channels.fetch(previousChannelInfo.channelID)
        .then(previousChannel => {
          var usersInPreviousChannel = previousChannel.members.size;
          if(usersInPreviousChannel == 0)
          {
            var role = previousChannel.guild.roles.cache.find(role => role.name === previousChannel.name);
            if(role != undefined)
            {
              role.delete();
            }          
          }
          else
          {
              var foundRole = previousChannel.guild.roles.cache.find(role => role.name === previousChannel.name);
              console.log(previousChannelInfo.id)
              var member = previousChannelInfo.guild.members.cache.get(previousChannelInfo.id);
              member.roles.remove(foundRole);
          }   
        });
        //LEFT CHANNEL
      }
      else
      {
        client.channels.fetch(currentChannelInfo.channelID)
        .then(channel => {
          if(previousChannelInfo.channelID == null)
          {

            //JOINED VOICE CHANNEL
            console.log("joined Voice");
            channel.guild.roles.create({
              data: {
                name: channel.name,
                color: RoleColour,
              },
              reason: "test"
            }).then(function() {
            
              client.channels.fetch(currentChannelInfo.channelID)
              .then(currentChannel => {
    
                var foundRole = currentChannel.guild.roles.cache.find(role => role.name === currentChannel.name);
                var member = currentChannelInfo.guild.members.cache.get(currentChannelInfo.id);
                member.roles.add(foundRole);
    
              });

            }).catch(console.error);
            //var foundRole = client.guild.roles.cache.find(role => role.name === channel.name);

          }
          else
          {

            //JOINED DIFFERENT CHANNEL
            client.channels.fetch(previousChannelInfo.channelID)
            .then(previousChannel => {
              var usersInPreviousChannel = previousChannel.members.size;
              console.log(previousChannelInfo.channelID)
              if(usersInPreviousChannel == 0)
              {
                var role = previousChannel.guild.roles.cache.find(role => role.name === previousChannel.name);
                if(role != undefined)
                {
                  role.delete();
                }
              }
              else
              {
                  var foundRole = previousChannel.guild.roles.cache.find(role => role.name === previousChannel.name);
                  console.log(previousChannelInfo.id)
                  var member = previousChannelInfo.guild.members.cache.get(previousChannelInfo.id);
                  member.roles.remove(foundRole);
              }   
            });

            channel.guild.roles.create({
              data: {
                name: channel.name,
                color: RoleColour,
              },
              reason: "test"
            }).then(function() {
            
              client.channels.fetch(currentChannelInfo.channelID)
              .then(currentChannel => {
    
                var foundRole = currentChannel.guild.roles.cache.find(role => role.name === currentChannel.name);
                var member = currentChannelInfo.guild.members.cache.get(currentChannelInfo.id);
                member.roles.add(foundRole);
    
              });

            }).catch(console.error);
          
          }


        });
      }
      

  //#endregion
    }

  }
}