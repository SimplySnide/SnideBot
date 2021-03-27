const { DiscordAPIError, MessageEmbed } = require('discord.js');
const config = require('dotenv').config();
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const nightFall = require('./nightfallData.json');
var nightfallList;

module.exports = class Nightfall extends BaseCommand {
  constructor() {
    super('nightfall', 'nightfall', ['nf']);
  }
  
  async run(client, message, args) {

    NightfallMessage(message);
    
  }
}


function NightfallMessage(message)
{
  var strike = String(message).split(" ")[1];
  var strikeLower =  String(strike).toLocaleLowerCase();
  //const nightfallList = [nightFall.ArmsDealer,nightFall.Broodhold,nightFall.Corrupted,nightFall.DevilsLair,nightFall.Disgraced,nightFall.ExodusCrash,nightFall.FallenSABER,nightFall.Glassway,nightFall.HollowedLair,nightFall.InsightTerminus,nightFall.InvertedSpire,nightFall.LakeOfShadows,nightFall.ProvingGround,nightFall.WardenOfNothing,nightFall.ScarletKeep];

  nightfallList = new Array(Object.keys(nightFall).length);
  var count = 0;

  for (nf in nightFall) {
    nightfallList[count] =nightFall[nf];
    count++;
  }

  if(strike != null) //Checkis if the user has not entered a 2nd argument
  {
    var found = false;
    for (let index = 0; index < nightfallList.length ; index++) {
      
      if(nightfallList[index].commandname.includes(strikeLower)) //Checks if strike exists
      {
        found = true;

        let nightfallData = nightfallList[index];

        const newEmbed = new MessageEmbed();
        if(nightfallData.hashIdentifier == -1){
          message.channel.send("Invalid Grandmaster: The Destiny 2 API does not currently have \'"+ nightfallList[index].name +"\' as a Grandmaster.");
        }
        else
        {
          //message.channel.send("Just a moment...");
          message.reply("Just one moment...")
          .then(msg => {
            getNightfall(nightfallData.hashIdentifier, message, newEmbed, msg);
          }).catch("Error: Could not find message");
        }
      }
    }
    if(!found)
    {
      message.channel.send('Unknown Strike: Could not find strike "' + strike + '".');
    }
  }
  else
  {
    //message.channel.send("Just a moment...");

    message.reply("Just one moment...")
    .then(msg => {
      getNightfallMilestone(message, msg);
    }).catch("Error: Could not find message");

  }
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

function getNightfallMilestone(message,optionalLoadMessage) //Recieves strike shield information from nightfallData.json
{

  get("https://www.bungie.net/Platform/Destiny2/Milestones/",
  function () {

    var json  = JSON.parse(this.responseText);
    const newEmbed = new MessageEmbed();
    const weeklyNightFall = 1942283261;
    if(json.Response[weeklyNightFall].activities.length >= 0)
    {
      getNightfall(json.Response[weeklyNightFall].activities[json.Response[weeklyNightFall].activities.length -1 ].activityHash, message, newEmbed,optionalLoadMessage);
    }else
    {
      message.channel.send("Error: This milestone does not contain any activites.");
      optionalLoadMessage.delete();
    }
  });

}

function getNightfall(milestoneHash, message,newEmbed,optionalLoadMessage)
{
  var entityDefinition = 'DestinyActivityDefinition';

  get("https://www.bungie.net/Platform/Destiny2/Manifest/"+ entityDefinition +"/" + milestoneHash,
  function () {

    var json  = JSON.parse(this.responseText);
      
    embedNightfallData(json.Response, message,newEmbed,optionalLoadMessage);

    //const nightfallList = [nightFall.ArmsDealer,nightFall.Broodhold,nightFall.Corrupted,nightFall.DevilsLair,nightFall.Disgraced,nightFall.ExodusCrash,nightFall.FallenSABER,nightFall.Glassway,nightFall.HollowedLair,nightFall.InsightTerminus,nightFall.InvertedSpire,nightFall.LakeOfShadows,nightFall.ProvingGround,nightFall.ScarletKeep,nightFall.WardenOfNothing];
    for (let index = 0; index < nightfallList.length; index++) {

      if(json.Response.hash == nightfallList[index].hashIdentifier) //Checks if strike exists
      {
        let nightfallData = nightfallList[index];
        newEmbed.addField('Shields', shieldData(nightfallData), true);
      }
    }
  });
}

function getKeptModifiers(jsonHash)
{
  //const nightfallList = [nightFall.ArmsDealer,nightFall.Broodhold,nightFall.Corrupted,nightFall.DevilsLair,nightFall.Disgraced,nightFall.ExodusCrash,nightFall.FallenSABER,nightFall.Glassway,nightFall.HollowedLair,nightFall.InsightTerminus,nightFall.InvertedSpire,nightFall.LakeOfShadows,nightFall.ProvingGround,nightFall.WardenOfNothing,nightFall.ScarletKeep];

  for (nf of nightfallList) {

    if(jsonHash == nf.hashIdentifier) //Checks if strike exists
    {
      return nightfallData = nf.KeptModifiers;
    }
  }
  return [-1];
}

async function embedNightfallData(json, message, newEmbed,optionalLoadMessage)
{

  var DestinyActivityModifierDefinition = "DestinyActivityModifierDefinition";
  var nightfallname = json.displayProperties.name
  var nightfalldescription = json.displayProperties.description;
  var modifierString = "";
  var count = 0;
  var keptModifiers = getKeptModifiers(json.hash); //0-12
  //var keptModifiers = [0,1,2,3,4,5,6,7,8,9,10,11,12]; //0-12

  if(json.modifiers.length - 1  < 0)
  {

    newEmbed.setColor('#477ba9')
    newEmbed.setTitle(nightfallname); 
    newEmbed.setDescription(nightfalldescription); 
    newEmbed.setImage("https://www.bungie.net" + json.pgcrImage);
    newEmbed.setThumbnail("https://www.bungie.net" + json.displayProperties.icon);
    newEmbed.setFooter('\'Snide Bot created by SimplySnide\'');

    message.channel.send(newEmbed);
    
    optionalLoadMessage.delete();
  }
  else
  {
    if(keptModifiers[0] == -1)
    {
      keptModifiers = new Array(json.modifiers.length -1 );
      for (let index = 0; index < json.modifiers.length - 1; index++) {
        keptModifiers[index] = index;
      }

    }

    var modifierList = new Array(keptModifiers.length );
    for (index of keptModifiers) {

      await get("https://www.bungie.net/Platform/Destiny2/Manifest/"+ DestinyActivityModifierDefinition +"/" + json.modifiers[index].activityModifierHash,

      function () {
        var jsonModifier = JSON.parse(this.responseText); //Stores current activity modifier

        modifierList[count] = jsonModifier.Response.displayProperties.name;

        if(String(modifierList[count]).includes("Barrier"))
        {
          modifierList[count] = modifierList[count] + '<:AntiBarrier:819343119103426611>';
        }else if(String(modifierList[count]).includes("Unstoppable"))
        {
          modifierList[count] = modifierList[count] + ' <:Unstoppable:819343119425601556>';

        }else if(String(modifierList[count]).includes("Overload"))
        {
          modifierList[count] = modifierList[count] + ' <:Overload:819343119451422720>';
        }

        if(count == keptModifiers.length - 1 || keptModifiers[count + 1] > json.modifiers.length - 1)
        {

          modifierList.sort(function(a, b) {return a.length - b.length });
          
          for (modifier of modifierList) {
            if(modifier != undefined)
            {
              modifierString = modifierString + " " + modifier + " \n"
            }
          }

          newEmbed.setColor('#477ba9')
          newEmbed.setTitle(nightfallname); 
          newEmbed.setDescription(nightfalldescription); 
          newEmbed.setImage("https://www.bungie.net" + json.pgcrImage);
          newEmbed.setThumbnail("https://www.bungie.net" + json.displayProperties.icon);
          newEmbed.addField("Modifieres", modifierString , true);
          newEmbed.setFooter('\'Snide Bot created by SimplySnide\'');

          message.channel.send(newEmbed);
          
          optionalLoadMessage.delete();

        }
        count = count + 1
      });
    }
    
  }
} 

function shieldData(nightfall) //Recieves strike shield information from nightfallData.json
{
    var shieldString = ""
    for (let i = 0; i < nightfall.shields.length ; i++) {
    shieldString += nightfall.shields[i] + "\n"
    }
    return shieldString
}

function championData(nightfall) //Recieves strike champion information from nightfallData.json
{
    var championString = ""
    for (let i = 0; i < nightfall.champions.length ; i++) {
        championString += nightfall.champions[i] + "\n"
    }
    return championString
}


