const { DiscordAPIError, MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const config = require('dotenv').config();

module.exports = class AccessToken extends BaseCommand {
    constructor() {
      super('', '', []);
    }
    //a8919009f0027f3e2842c0398164b72e
    async run(client, message, args) {

      // getTest(
      //   function () {
      //     console.log(this.getRequestHeader);
      //   });
        
        getAuthorized("https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018506576963/Character/2305843009681194902/Vendors/2190858386/?components=402,400,401",
        function () {
          console.log(this)
          // var json  = JSON.parse(this.responseText);
          // console.log(json.Response);
        });
    }
}

async function getAuthorized(url, callback) {
  var xhr = new XMLHttpRequest();
  var AccessToken = 'CJGOAxKGAgAgdbuZbvZFny6AFN0oJ9shJCqXwz/LaGY7pPyMvf+u0ArgAAAA0bWOeYPtkLY+0ldg8SG2AncG4jDIqdnAkamwAJQKQ1aJCPZC8oNRkrNU3y6bAeRRA9C0vNprh4+i43dw1LsMfecNdbJhctO3th+0xqSATYWQx0x98kRB1AUI9dBmjMZ+i3n/GpCFTPzomqG0B+RkOyS24n1QiDkvlG+0z2+grL9LqJEs1mw8DLRsbedfR73BiquYp6dJU7jMOFbNljKob5WOfMD2bbBSUeRARb/71CwbWvm6d6DiEGQam1aDRaZyWarDUaZg8F+z5SO4/KmTNu9neV+aZf/DnZd2N4gPZ2U=';
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.setRequestHeader("Authorization", "Bearer " + AccessToken);

  xhr.onreadystatechange = function () {

              callback.apply(xhr);

  };
  xhr.send();
}

async function getTest(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://www.bungie.net/en/oauth/authorize?client_id=35830&response_type=code", true);
  xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
  xhr.onreadystatechange = function () {

              callback.apply(xhr);

  };
  xhr.send();
}

async function get(url, callback) {

    var clientID = process.env.BUNGIE_CLIENTID;
    var autherizationCode = 'b7f6333513d0a5ca6ca03f2b7d71e1e4';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-API-Key", process.env.BUNGIE_API);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("client_id="+ clientID + "&grant_type=authorization_code&code=" + autherizationCode);
    xhr.onreadystatechange = function () {

          callback.apply(xhr);
    }


};
