const { DiscordAPIError, MessageEmbed, UserFlags } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var discordMessage = "";
var waitMessage;
module.exports = class Xur extends BaseCommand {
  constructor() {
    super('', '', []);
  }
  
  async run(client, message, args) {
    discordMessage = message;
    discordMessage.reply("Just one moment...")
    .then(msg => {
      waitMessage = msg;
      getXurInventory();
    });
  }
}

async function getItem(itemHash)
{
  var json = await awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash + "/");
  return json.Response;
}


function timeDifferance(date_future, date_now, departure) //
{
  const pstToUTCDifference = 8;
  var moment = require('moment');

  var start_date = moment(date_now, 'YYYY-MM-DD HH:mm:ss');
  var end_date = moment(date_future, 'YYYY-MM-DD HH:mm:ss');

  var duration = moment.duration(end_date.diff(start_date)).add(pstToUTCDifference, 'hours');

  if(departure)
  {
    duration.add(-3, 'days');
  }
  var days = Math.floor(duration.asDays());    
  var hours = Math.floor(duration.asHours()) % 24;
  var minutes = Math.floor(duration.asMinutes()) % 60;
  var seconds = (Math.floor(duration.asSeconds()) % 60);
  
  return days + "d : " + hours+ "h : " + minutes + "m : " + seconds + "s";
}

function getXurInventory()
{
    const xurHash = '2190858386';
    get("https://www.bungie.net/Platform/Destiny2/Vendors/?components=402,400",
    async function () {
      var json  = JSON.parse(this.responseText);
      var itemSales = json.Response.sales.data[xurHash].saleItems;

      var totalItems = 0
      for (const iterator in itemSales) {
        totalItems = totalItems + 1;
      }

      var date_future = new Date(json.Response.vendors.data[xurHash].nextRefreshDate);
      var date_now = new Date();
      
      if(totalItems <= 2)
      {
        discordMessage.channel.send("Xur is currently restocking his inventory, he will be back in : " + timeDifferance(date_future, date_now));
      }
      else
      {

        var xurInfo = await awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyVendorDefinition/"+xurHash+"/");

        const xurEmbed = new MessageEmbed;
        xurEmbed.setTitle(xurInfo.Response.displayProperties.name);
        xurEmbed.setDescription(xurInfo.Response.displayProperties.description);
        xurEmbed.setThumbnail("https://www.bungie.net" + xurInfo.Response.displayProperties.icon);
        xurEmbed.setImage("https://www.bungie.net" + xurInfo.Response.displayProperties.largeIcon);
        xurEmbed.setColor('#477ba9');
        //xurEmbed.setFooter('\'Snide Bot created by SimplySnide\'');
        xurEmbed.setFooter('Xur leaves in  : ' + timeDifferance(date_future, date_now, true) + '\n\'Snide Bot created by SimplySnide\'');

        const ignoredItems = [2125848607,3875551374]
        const playerClass = ["Titan","Hunter","Warlock"]
        var count = 0
        for (iterator in itemSales) {
          if(!ignoredItems.includes(itemSales[iterator].itemHash))
          {
            var item = await getItem(itemSales[iterator].itemHash);
            if(item.classType < 3)
            {
              xurEmbed.addField(item.displayProperties.name, playerClass[item.classType]+" "+ item.itemTypeDisplayName+"\n[view](https://www.bungie.net"+ item.screenshot +")",true);
            }
            else
            {
              xurEmbed.addField(item.displayProperties.name, item.itemTypeDisplayName+"\n[view](https://www.bungie.net"+ item.screenshot +")",true);
            }
          }
          count = count + 1;
        }
        waitMessage.delete();
        discordMessage.channel.send(xurEmbed);
      }

    });
}


async function awaitGet(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  return new Promise((resolve, reject) => 
  {
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && this.status === 200) {
            resolve(JSON.parse(xhr.responseText));
        }
    };
    xhr.send();
  });

}

//Platform/Destiny2/Vendors/?components=400,402
async function get(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && this.status === 200) {
          if (typeof callback === "function") {
              callback.apply(xhr);
          }
      }
  };
  xhr.send();
}