const { DiscordAPIError, MessageEmbed, UserFlags } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var authorization = require("../../commands/test/AccessToken.js");
const xurHash = '2190858386';
//const weaponStatOrder=["Stability","Handling","Range","Magazine","Impact","Reload Speed","Rounds Per Minute"]

const armourStatOrder=["Mobility","Resilience","Recovery","Discpiline","Intellect","Strength"]
const armourStatOrderIndex = [2996146975,392767087,1943323491,1735777505,144602215,4244567218]

const playerClass = ["<:Titan:825878019201302548>","<:Hunter:825878018593390603>","<:Warlock:825878019443916830>","<:Weapon:825879603637518336>"]

module.exports = class XurV2 extends BaseCommand {
  constructor() {
    super('xur', 'xur', []);
  }
  //
  async run(client, message, args) {

        message.reply("Lets see what Xur is selling...").then(msg => {
            getAuthorized("https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018506576963/Character/2305843009681194902/Vendors/" + xurHash + "/?components=304,400,402",
            function () {
                var json  = JSON.parse(this.responseText).Response;
                var date_future = new Date(json.vendor.data.nextRefreshDate);
                var date_now = new Date();
                if(json.vendor.data.enabled) //Xur is active
                {
                    const xurEmbed = new MessageEmbed;
                    var itemSales = json.sales.data;
                    
                    get("https://paracausal.science/xur/current.json", //Credit to  https://twitter.com/nev_rtheless for providing Xur's location.
                    async function () {
                        var XurLocation  = JSON.parse(this.responseText);
                        var location = (XurLocation.location).charAt(0).toUpperCase() + (XurLocation.location).slice(1);
                        xurEmbed.addField("Location:", location + ", _" + XurLocation.locationName + "_");                    
                    });
        
                    get("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyVendorDefinition/"+xurHash+"/",
                    async function () {
                        var xurVendorData  = JSON.parse(this.responseText).Response;
                        xurEmbed.setTitle(xurVendorData.displayProperties.name);
                        xurEmbed.setDescription(xurVendorData.displayProperties.description);
                        xurEmbed.setThumbnail("https://www.bungie.net/" + xurVendorData.displayProperties.icon);
                        xurEmbed.setColor('#477ba9');
                        xurEmbed.setFooter('Xur leaves in  : ' + timeDifferance(date_future, date_now, true) + '\n\'Snide Bot created by SimplySnide\'');
                        const ignoredItems = [2125848607,3875551374];
                        var itemHash = [];
                        var itemStats = []
                        for (var data in itemSales) 
                        {
                            if(!ignoredItems.includes(itemSales[data].itemHash))
                            {
                                itemHash.push(itemSales[data].itemHash);
                                itemStats.push(json.itemComponents.stats.data[data].stats); 
                            }
                        }
        
                        var itemArray = await Promise.all([
                            awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash[0] + "/"),
                            awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash[1] + "/"),
                            awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash[2] + "/"),
                            awaitGet("https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/" + itemHash[3] + "/")
                        ])
                        
                        const highStat = 20;
                        //[view](https://www.bungie.net"+ item.screenshot +")"
                        for (let index = 1; index < itemArray.length; index++) {
                            var armourStats = "\n";
                            var total = 0;
        
                            if(index != 0)
                            {   
                                var item = itemStats[index];
                                for (let stat = 0; stat < armourStatOrderIndex.length; stat++) {
                                    armourStats= armourStats + armourStatOrder[stat] + ": " + item[armourStatOrderIndex[stat]].value;
                                    //armourStats= armourStats + armourStatOrder[stat] + ": " + item[armourStatOrderIndex[stat]].value + ", ";
                                    //
                                    //+ "\n"
                                    if(item[armourStatOrderIndex[stat]].value >= highStat){armourStats = armourStats + " \:star: \n"}

                                    else{armourStats = armourStats + "\n"}

                                    total = total + item[armourStatOrderIndex[stat]].value;
                                }
                                armourStats = "_" + armourStats + "_\n Total: "+ total;
                            }else
                            {
                                armourStats="";
                            }
                            xurEmbed.addField(playerClass[itemArray[index].Response.classType]+" "+ itemArray[index].Response.displayProperties.name, "***" + itemArray[index].Response.itemTypeDisplayName + "***" + armourStats + "\n[View](https://www.bungie.net" + itemArray[index].Response.screenshot + ")\n", true);                    
        
                            if(index == itemArray.length - 1)
                            {
                                index = -1;
                            }
                            else
                            {
                                if(index == 0)
                                {
                                    index = itemArray.length + 1;
                                }
                            }
                        }
                        msg.delete();
                        message.channel.send(xurEmbed);
                    });
                }
                else    //Xur is not active
                {
                    message.channel.send("Xur is currently restocking his inventory, he will be back in : " + timeDifferance(date_future, date_now));
                }
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