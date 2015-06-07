var fs = require('fs');
var ejs = require("ejs");

var emailTemplate = fs.readFileSync("email_template.ejs", "utf8");


function csvParse(file) {
  var mailObjects = [];
  var csvArray = file.split("\n");
  var keyArray = csvArray.shift().split(",");

  for(var i = 0; i < csvArray.length; i++){
    var mailTo = csvArray[i];
    if(csvArray[i] != ""){
      var tempObj = {};
      for(var key = 0; key < keyArray.length; key++){
        var objectArray = csvArray[i].split(",");
        tempObj[keyArray[key]] = objectArray[key];
      }
      mailObjects.push(tempObj);
    }
  }
  return mailObjects;
}

function makeEmail(mailingList){
  var emails = [];

  for(var i = 0; i < mailingList.length; i++){
    emails.push(ejs.render(emailTemplate, mailingList[i]));
  }

  return emails;
}

module.exports.csvParse = csvParse;
module.exports.makeEmail = makeEmail;
