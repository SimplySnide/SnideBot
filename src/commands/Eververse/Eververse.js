const { DiscordAPIError, MessageEmbed, UserFlags } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var authorization = require("../../commands/test/AccessToken.js");
const eververseHash = '3361454721';
const includedSilverCatagories = [2];
const includedBrightCatagories =[3,9];

//const playerClass = ["<:Titan:825878019201302548>","<:Hunter:825878018593390603>","<:Warlock:825878019443916830>","<:Weapon:825879603637518336>"]

module.exports = class XurV2 extends BaseCommand {
  constructor() {
    super('eververse', 'eververse', ['ever','tess','e']);
  }
  //
    async run(client, message, args) {

        message.reply("Lets see what Tess is selling...").then(msg => {

            getAuthorized("https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018506576963/Character/2305843009681194902/Vendors/" + eververseHash + "/?components=402,401,400",
                function () {
                    var json  = JSON.parse(this.responseText).Response;
                    var silverItemHash = []; //ItemHash in index 0, Cost in position 1
                    var brightDustHash = [];
                    var date_future = new Date(json.vendor.data.nextRefreshDate);
                    var date_now = new Date();
    
                    for (var catagory of includedSilverCatagories) {
                        for (const key of json.categories.data.categories[catagory].itemIndexes) {
                            silverItemHash.push([json.sales.data[key].itemHash, json.sales.data[key].costs[0].quantity]);
                        }
                    }
                    for (var catagory of includedBrightCatagories) {
                        for (const key of json.categories.data.categories[catagory].itemIndexes) {
                            brightDustHash.push([json.sales.data[key].itemHash, json.sales.data[key].costs[0].quantity]);
                        }
                    }
    
                    get("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyVendorDefinition/"+eververseHash+"/",
                        async function () {
                            var eververseData  = JSON.parse(this.responseText).Response;
                            const eververseEmbed = new MessageEmbed;
                            eververseEmbed.setTitle(eververseData.displayProperties.name);
                            eververseEmbed.setDescription(eververseData.displayProperties.description);
                            eververseEmbed.setThumbnail("https://www.bungie.net/" + eververseData.displayProperties.icon);
                            eververseEmbed.setColor('#477ba9');
                            eververseEmbed.setFooter('Next refresh : ' + timeDifferance(date_future, date_now) + '\n\'Snide Bot created by SimplySnide\'');
                            eververseEmbed.setThumbnail("https://www.bungie.net/" + eververseData.displayProperties.icon);
                            eververseEmbed.setImage("https://www.bungie.net/" + eververseData.displayProperties.largeIcon);
                            var silverItemArray = [];
                            const ignorderItems = [353932628,3187955025,2638689062];
                            const ornamentID = 21;
                            const exoticHash = 2759499571;
                            //const ignorderItems = [];

                            for (var itemHash of silverItemHash) {
                                silverItemArray.push(awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash[0] + "/"));
                            }
                            var brightItemArray = []
                            for (var itemHash of brightDustHash) {
                                if(!ignorderItems.includes(itemHash[0]))
                                {
                                    brightItemArray.push(awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash[0] + "/"));
                                }
                            }

                            await Promise.all(silverItemArray)
                            .then(silver => {
                                var itemString = "";

                                for (var item of silver) {
                                    
                                    var trueCost = 0;
                                    for (const cost of silverItemHash) {
                                        if(cost[0] == item.Response.hash)
                                        {
                                            trueCost = cost[1];
                                        }
                                    }
                                    if(item.Response.itemSubType == ornamentID && item.Response.inventory.tierTypeHash == exoticHash)
                                    {
                                        itemString = itemString +"["+item.Response.displayProperties.name+"](https://www.bungie.net" + item.Response.screenshot +"), _Cost : " + trueCost +"_\n";
                                    }
                                    else
                                    {
                                        itemString = itemString + item.Response.displayProperties.name +  ", _Cost : " + trueCost +"_\n";
                                    } 
                                }
                                eververseEmbed.addField("Silver Items: ", itemString);

                            })
                            .catch((e) => {
                                console.log(e);
                            });

                            await Promise.all(brightItemArray)
                            .then(bright => {
                                var itemString = "";
                                for (var item of bright) {
                                    var trueCost = 0;
                                    for (const cost of brightDustHash) {
                                        if(cost[0] == item.Response.hash)
                                        {
                                            trueCost = cost[1];
                                        }
                                    }
                                    if(item.Response.itemSubType == ornamentID && item.Response.inventory.tierTypeHash == exoticHash)
                                    {
                                        itemString = itemString +"["+item.Response.displayProperties.name+"](https://www.bungie.net" + item.Response.screenshot +"), _Cost : " + trueCost +"_\n";
                                    }
                                    else
                                    {
                                        itemString = itemString + item.Response.displayProperties.name +  ", _Cost : " + trueCost +"_\n";
                                    }                             
                                }
                                eververseEmbed.addField("Brightdust Items: ", itemString);
                            })
                            .catch((e) => {
                                console.log(e);
                            });

                            eververseEmbed.addField("View Full: ", "https://www.todayindestiny.com/eververseWeekly");

                            msg.delete();
                            message.channel.send(eververseEmbed);


                    });
            });
        });
    }
}

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

async function getAuthorized(url, callback) { //Used to get APIO Item DATA
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
    xhr.setRequestHeader("Authorization", "Bearer " + await authorization.getNewAccessToken());

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) { 
            if (typeof callback === "function") {
                callback.apply(xhr);
            }
        }
    };
    xhr.send();
}

function timeDifferance(date_future, date_now, departure) //
{
  var moment = require('moment');

  var start_date = moment(date_now, 'YYYY-MM-DD HH:mm:ss');
  var end_date = moment(date_future, 'YYYY-MM-DD HH:mm:ss');

  var duration = moment.duration(end_date.diff(start_date));

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