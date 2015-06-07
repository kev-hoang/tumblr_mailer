var fs = require('fs');
var ejs = require("ejs");
var tumblr = require("tumblr.js");
var client = tumblr.createClient({
  consumer_key: 'VmpopRrkihrXXRSFUljuraoZBUdwIQDkRVTaExiJDm3vXGQCzH',
  consumer_secret: 'aodROkELXPhws3pUhM0WHlOsApplXd6lYONoqvlDJ8vmqLvkHa',
  token: 'P7pwlN3vPQgRecTfDRjILz9Rd1Y9STvfISOaxlKRVBoyoQVXMa',
  token_secret: 'OW3vAXkTCuqiY8wJyyJTTz99IqjjqxYWZQ2kIWNzKkQwJzdF1M'
});
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('J8wNEgNZpBKrT0imLEKDLQ');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
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

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }

client.posts("unsageable.tumblr.com", function(err, blog){
  var latestPosts = [];
	var allPosts = blog.posts;

	for (var i = 0; i < allPosts.length; i++) {
	 	var currentTime = Math.floor(Date.now() / 1000);
		if((currentTime - allPosts[i]["timestamp"]) < 518400){
	 		var blogObj = {};
			blogObj.href = allPosts[i].short_url;
			blogObj.title = allPosts[i].title;
			latestPosts.push(blogObj);
	 	}
	};

  var toMail = csvParse(csvFile);

  for (var j = 0; j < toMail.length; j++) {
    toMail[j].latestPosts = latestPosts;
  };

  var allEmails = makeEmail(toMail);

  for (var k = 0; k < allEmails.length; k++) {
    sendEmail(toMail[k]["firstName"], toMail[k]["emailAddress"], "Kevin Hoang", "find.kevinhoang@gmail.com", "Hey, This is What I've Been Up To", allEmails[k]);
  };

})
