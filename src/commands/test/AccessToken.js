const { DiscordAPIError, MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const config = require('dotenv').config();
var currentActiveToken = undefined;

module.exports = class AccessToken extends BaseCommand {
    constructor() {
      super('', '', []);
    }

    async run(client, message, args) {

      var accessToken = await getNewAccessToken();
      getAuthorized("https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018506576963/Character/2305843009681194902/Vendors/3361454721/?components=402,400,401", accessToken,
      function () {
        console.log(JSON.parse(this.responseText).Response)
      });
    }
}

async function getAccessTokenAuthCode(authorizationCode)
{
  var responseText = await getAccessCode_AuthorizationCode(authorizationCode);
  await writeRefreshToken(responseText);
  console.log("Success : \n"+ JSON.parse(await readRefreshToken()));
}

async function getNewAccessToken()
{
  var currentRefreshToken = JSON.parse(await readRefreshToken());
  var newResponseData = JSON.parse(await getAccessCode_RefreshToken(currentRefreshToken.refresh_token));
  if(newResponseData != 404)
  {
    writeRefreshToken(JSON.stringify(newResponseData));
    return newResponseData.access_token
  }
  else
  {
    return 404 //Data invalid, recreate token with authorization code
  }


}

async function writeRefreshToken(respnseData)
{
  const fs = require("fs");
  const fsPromises = require('fs').promises;
  await fsPromises.writeFile('./src/commands/test/TextFile/refreshToken.txt', JSON.stringify(encrypt(respnseData)));
}

async function readRefreshToken()
{
  const fs = require("fs");
  const fsPromises = require('fs').promises;
  return decrypt(JSON.parse(await fsPromises.readFile('./src/commands/test/TextFile/refreshToken.txt')));
}

async function getAuthorized(url,AccessToken, callback) { //Used to get APIO Item DATA
  console.log(AccessToken);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.setRequestHeader("Authorization", "Bearer " + AccessToken);

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) { 
      callback.apply(xhr);
    }
  };
  xhr.send();
}

async function getPersonalAuth(callback) {//Not used
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://snidebot.simplysnide.repl.co/Auth", true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status === 200) { 
      callback.apply(xhr.responseText);
    }
    else
    {
      resolve("Invalid");
    }
  };
  xhr.send();
}

async function getAccessCode_AuthorizationCode(autherizationCode) { //Request Access Token

  var clientID = process.env.BUNGIE_CLIENTID;
  var client_Secret = process.env.BUNGIE_CLIENTSECRET;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://www.bungie.net/platform/app/oauth/token/", true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send("client_id="+ clientID + "&client_secret="+client_Secret+"&grant_type=authorization_code&code=" + autherizationCode);
  return new Promise((resolve, reject) => 
  {
    xhr.onreadystatechange = async function () {
      if (this.readyState == 4 && this.status == 200) { 
        resolve(xhr.responseText);
      }
    }
  });
};

async function getAccessCode_RefreshToken(RefreshToken) { //Request Access Token (pass a RefreshToken NOT a AuthorizationCode to get a access code and another refresh token to update) this is used once the user has approved the application to avoid excesive approval clicks

  var clientID = process.env.BUNGIE_CLIENTID;
  var client_Secret = process.env.BUNGIE_CLIENTSECRET;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://www.bungie.net/platform/app/oauth/token/", true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send("client_id="+ clientID + "&client_secret="+client_Secret+"&grant_type=refresh_token&refresh_token=" + RefreshToken);
  return new Promise((resolve, reject) => 
  {
    xhr.onreadystatechange = async function () {
      if (this.readyState == 4 && this.status == 200) { 
        resolve(xhr.responseText);
      }
      else if(this.readyState == 4 && this.status == 400)
      {
      }
    }
  });
}

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

function encrypt(text) {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

module.exports = { getNewAccessToken };

// var hw = encrypt("Some serious stuff")
// console.log(hw)
// console.log(decrypt(hw))
