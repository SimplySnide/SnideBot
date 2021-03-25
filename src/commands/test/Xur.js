const { DiscordAPIError, MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var discordMessage = "";
module.exports = class Xur extends BaseCommand {
  constructor() {
    super('xur', 'xur', []);
  }
  
  async run(client, message, args) {
    discordMessage = message;
    getXurInventory();
  }
}

function getItem(itemHash, optionalXurDetails)
{
    //t/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/814876685/
    get("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash + "/",
    function () {
      var json  = JSON.parse(this.responseText);
      const newEmbed = new MessageEmbed();
      newEmbed.setThumbnail("https://www.bungie.net/" + json.Response.displayProperties.icon)
      newEmbed.addField(json.Response.displayProperties.name, json.Response.itemTypeAndTierDisplayName)//itemTypeAndTierDisplayName
      if(optionalXurDetails.costs[0] != undefined)
      {
        newEmbed.setFooter("Legendary Shards : " + optionalXurDetails.costs[0].quantity)

      }
      else{
        newEmbed.setFooter("Legendary Shards : " + 0)

      }
      discordMessage.channel.send(newEmbed)
    });
}


function timeDifferance(date_future, date_now) //
{
  const pstToUTCDifference = 8;
  var moment = require('moment');

  var start_date = moment(date_now, 'YYYY-MM-DD HH:mm:ss');
  var end_date = moment(date_future, 'YYYY-MM-DD HH:mm:ss');

  var duration = moment.duration(end_date.diff(start_date)).add(pstToUTCDifference, 'hours');
  console.log(duration.asDays())
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
    function () {
      var json  = JSON.parse(this.responseText);
      var itemSales = json.Response.sales.data[xurHash].saleItems;

      var totalItems = 0
      for (const iterator in itemSales) {
        totalItems = totalItems + 1;
      }

      if(totalItems <= 2)
      {
        var date_future = new Date(json.Response.vendors.data[xurHash].nextRefreshDate);
        var date_now = new Date();


        discordMessage.channel.send("Xur is currently restocking his inventory, he will be back in : " + timeDifferance(date_future, date_now));
      }
      else
      {
        const ignoredItems = [];
        var itemArray = new Array(totalItems)
        var count = 0;
  
        for (item in itemSales) {
          if(!ignoredItems.includes(itemSales[item].itemHash))
          {
            itemArray[count] = itemSales[item];
            //getItem(itemSales[item].itemHash, itemSales[item]);
          }
          count = count + 1;
        }
        console.log(itemArray);
        // itemArray.sort(function(a, b) {
        //   return parseFloat(a.vendorItemIndex) - parseFloat(b.vendorItemIndex);
        // })
        
        for (const iterator of itemArray) {
          getItem(iterator.itemHash, iterator)
        }
      }


      // var lowestValue = Infinity;
      // var sortedItemArray = new Array(6);
      // var hashIndexexValue = 0;
      // var indexValue = 0;
      
      // count = 0;
      // for (let index = 0; index < itemArray.length; index++) {
      //   for (const item of itemArray) {
      //     if(item.vendorItemIndex < lowestValue)
      //     {
      //       lowestValue = item.vendorItemIndex;
      //       hashIndexexValue = item;
      //     }
      //   }
      //   sortedItemArray[index] = hashIndexexValue;
      //   itemArray = delete itemArray[itemArray.indexOf(hashIndexexValue)];
      //   console.log(itemArray);
      // }

      // for (const iterator of sortedItemArray) {
      //   console.log(iterator.itemHash);
      // }
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