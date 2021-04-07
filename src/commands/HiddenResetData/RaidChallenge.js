const { DiscordAPIError, MessageEmbed, UserFlags } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var authorization = require("../../commands/test/AccessToken.js");
const eververseHash = '3361454721';
var moment = require('moment');
const reset = require('./ResetDate.json');
//const playerClass = ["<:Titan:825878019201302548>","<:Hunter:825878018593390603>","<:Warlock:825878019443916830>","<:Weapon:825879603637518336>"]
var discordMessage = "";
var waitMesssage;

module.exports = class XurV2 extends BaseCommand {
  constructor() {
    super('challenge', 'raid_challenge', ['c','chal']);
  }
  //
    async run(client, message, args) {
        discordMessage = message;
        var activity = String(message).split(" ")[1];
        message.reply("Just one moment...").then(msg => {
            waitMesssage = msg;
            searchResetActivity(activity)
        });
    }
}

async function searchResetActivity(searchValue)
{
    var found = false;
    for (key in reset) {
        if(reset[key].searchTerms.includes(searchValue)) {
            found = true;
            const activity = reset[key];
            var challengeIndex = await getResetIndex(activity);
            //var challengeIndex = 3;

            const challengeEmbed = new MessageEmbed;
            challengeEmbed.setTitle(activity.challengeName[challengeIndex]);
            challengeEmbed.setDescription(activity.challengeGuide[challengeIndex]);
            if(activity.hasIcon){
                challengeEmbed.setThumbnail(activity.icon);
            }
            challengeEmbed.setColor('#477ba9')
            challengeEmbed.setFooter('\'Snide Bot created by SimplySnide\'');
            if(activity.cheatSheet[challengeIndex] == ""){
                console.log(activity.defaultImage);
                challengeEmbed.setImage(activity.defaultImage);
            }else{
                challengeEmbed.setImage(activity.cheatSheet[challengeIndex]);
            }
            waitMesssage.delete();
            discordMessage.channel.send(challengeEmbed);
        }
    }

    if(found == false){
        waitMesssage.delete();
        message.channel.send('Unknown Activity: Could not find strike "' + searchValue + '".');
    }
}

async function getResetIndex(jsonActivity)
{
    var test = await getAuthorized("https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018506576963/Character/2305843009681194902/Vendors/" + eververseHash + "/?components=400");

    var nextResetDate = moment(test.Response.vendor.data.nextRefreshDate) //Only needed to calculate current reset
    var currentResetDate = moment(nextResetDate).add(-7,'days')

    var lastDateChecked = moment(jsonActivity.lastDate);
    var weeksPast = Math.floor(timeDayDifferance(currentResetDate , lastDateChecked).asDays() / 7);
    var currentChallenge = (weeksPast + jsonActivity.challengeIndex) % jsonActivity.totalChallenges;
    return currentChallenge;
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

function timeDayDifferance(date_future, date_now, departure) //
{

  var start_date = moment(date_now, 'YYYY-MM-DD HH:mm:ss');
  var end_date = moment(date_future, 'YYYY-MM-DD HH:mm:ss');

  var duration = moment.duration(end_date.diff(start_date));
  
  return duration;
}