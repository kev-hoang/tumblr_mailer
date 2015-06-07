var emailHelper = require("./emailHelper.js");
var mandrill = require("./mandrill.js");
var fs = require("fs");
var tumblr = require("tumblr.js");
var client = tumblr.createClient({
  consumer_key: 'VmpopRrkihrXXRSFUljuraoZBUdwIQDkRVTaExiJDm3vXGQCzH',
  consumer_secret: 'aodROkELXPhws3pUhM0WHlOsApplXd6lYONoqvlDJ8vmqLvkHa',
  token: 'P7pwlN3vPQgRecTfDRjILz9Rd1Y9STvfISOaxlKRVBoyoQVXMa',
  token_secret: 'OW3vAXkTCuqiY8wJyyJTTz99IqjjqxYWZQ2kIWNzKkQwJzdF1M'
});

var csvFile = fs.readFileSync("friend_list.csv","utf8");

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

  var toMail = emailHelper.csvParse(csvFile);

  for (var j = 0; j < toMail.length; j++) {
    toMail[j].latestPosts = latestPosts;
  };

  var allEmails = emailHelper.makeEmail(toMail);

  for (var k = 0; k < allEmails.length; k++) {
    mandrill.sendEmail(toMail[k]["firstName"], toMail[k]["emailAddress"], "Kevin Hoang", "find.kevinhoang@gmail.com", "Hey, This is What I've Been Up To", allEmails[k]);
  };

})
