const { DiscordAPIError, MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var discordMessage = "";
module.exports = class Nightfall extends BaseCommand {
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
        newEmbed.setFooter("Lengedary Shards : " + optionalXurDetails.costs[0].quantity)

      }
      else{
        newEmbed.setFooter("Lengedary Shards : " + 0)

      }
      discordMessage.channel.send(newEmbed)
    });
}

function getXurInventory()
{
    const xurHash = '2190858386';
    get("https://www.bungie.net/Platform/Destiny2/Vendors/?components=402",
    function () {
      var json  = JSON.parse(this.responseText);
      console.log(json.Response);
      var itemSales = json.Response.sales.data[xurHash].saleItems;

      var totalItems = 0
      for (const iterator in itemSales) {
        totalItems = totalItems + 1;
      }

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