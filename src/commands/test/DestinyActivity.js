const { DiscordAPIError, MessageEmbed, Message, Guild, User } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = class Clear extends BaseCommand {
  constructor() {
    super('activity', 'activity', []);
  }
  


  async run(client, message, args) {

    var query = String(message).toString().split(' ').slice(1).join(' ')
    var DestinyActivityDefinition = 'DestinyActivityDefinition';
    var maxSearchValues = 5;
    var maxNonVisableSearchValues = 10;
    
    var lastElemIndex = String(message).toString().split(' ').length
    var lastElem = String(message).toString().split(' ')[lastElemIndex - 1]

    if(!isNaN(lastElem))
    {
      if(parseInt(lastElem) > maxNonVisableSearchValues)
      {
        maxSearchValues = maxNonVisableSearchValues;
      }else
      {
        maxSearchValues = parseInt(lastElem);
      }

      if(lastElemIndex>2)
      {
        query = query.substring(0, query.lastIndexOf(" "));

      }

    }

    get("https://www.bungie.net/Platform/Destiny2/Armory/Search/"+ DestinyActivityDefinition +"/" + query,
    async function () {

      var json  = JSON.parse(this.responseText).Response.results;
      var resultLength = json.totalResults;
      if(resultLength > 0)
      {
        if(resultLength == 1)
        {
          getActivity(json.results[0].hash,message);
        }
        else
        {

          if(resultLength < maxSearchValues)
          {
            maxSearchValues = resultLength;
          }

          var hashResults = new Array(maxSearchValues);
          for (let index = 0; index < maxSearchValues ; index++) {

            hashResults[index] = json.results[index];

          }

          var reactionList = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']

          const timeout = (maxSearchValues * 1000) + 5000

          const searchEmbed = new MessageEmbed();
          searchEmbed.setColor('#477ba9')
          searchEmbed.setTitle('Searched Activities:'); 
          searchEmbed.setDescription('React with the according activity you want to view.'); 

          var displayActivities = "";
          for (let index = 0; index < maxSearchValues ; index++) {
            displayActivities = displayActivities + " \n" + reactionList[index] + " : " +  hashResults[index].displayProperties.name
          }
          searchEmbed.addField("Activities :",displayActivities); 
          const msg = await message.channel.send(searchEmbed);

          for (let index = 0; index < maxSearchValues; index++) {

            await msg.react(reactionList[index]);
          }

          await msg.awaitReactions((reaction,user) => user.id == user.id && (reactionList.includes(reaction.emoji.name)), {max: 1, time: timeout})
          .then(async collected => 
              {
                  if(reactionList.includes(collected.first().emoji.name))
                  {
                    var selection = reactionList.indexOf(collected.first().emoji.name);
                    msg.delete().catch("Hmmmm");
                    getActivity(hashResults[selection].hash,message);

                  }
            
              }).catch(async ( )=> 
              {
                  msg.delete().catch("Hmmmm");
                  return message.reply("Invalid Response: You did not react to a message in the given time period.")
              
              });
        }
      }
      else
      {
        message.channel.send("Unknown Activity: Could not find activity \'" + query + "\'");
      }
    });
      
  }
  
}

function getActivity(hashIdentifier,message)
{
  get("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/" +hashIdentifier,
  function () {
    var json  = JSON.parse(this.responseText).Response;
    const activityEmbed = new MessageEmbed()
    activityEmbed.setTitle(json.originalDisplayProperties.name);
    activityEmbed.setDescription(json.originalDisplayProperties.description);
    if(json.displayProperties.hasIcon)
    {
      activityEmbed.setThumbnail("https://www.bungie.net/" + json.displayProperties.icon);
    }
    activityEmbed.setImage("https://www.bungie.net/" + json.pgcrImage);
    activityEmbed.setColor('#477ba9');
    message.channel.send(activityEmbed);
    
  });
}

async function get(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && this.status === 200) {
          // defensive check
          if (typeof callback === "function") {
              // apply() sets the meaning of "this" in the callback
              callback.apply(xhr);
          }
      }
  };
  xhr.send();
}