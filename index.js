require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");


// Creates express app
const app = express();
// The port used for Express server
const PORT = 3000;
// Starts server
app.listen(process.env.PORT || PORT, function() {
  console.log('Bot is listening on port ' + PORT);
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


function getUrl(stackData){
	let str="[";
	let i;
	for(i = 0; i < Object.keys( stackData['items']).length; i++){
		let obj = 
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "<" + stackData['items'][i]['link'] +'|'+ stackData['items'][i]['title']+">\n"
					}
				}
		str += JSON.stringify(obj);
		str+= ",";
	}
	str = str.slice(0,-1);
	str+="]";
	return str;
}

app.post('/', (req, res) => {
	if(req['body']['text']){
		request({ method: 'GET', 
		uri: 'https://api.stackexchange.com/2.2/search?pagesize=10&order=desc&sort=relevance&intitle='+
    		req['body']['text']+'&site=stackoverflow',
    	gzip: true
	    }, function(err, response, body) {
	    	let blocksData = getUrl(JSON.parse(body));

	    	var data = {form: {
		      token: process.env.SLACK_AUTH_TOKEN,
		      channel: "#capstonetest",
			    blocks: blocksData
			    }};
			request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
		      res.json();
		    });
	    });
	}
	else{
		var data = {form: {
		      token: process.env.SLACK_AUTH_TOKEN,
		      channel: "#capstonetest",
			   text: "searching parameter is empty"
			    }};
		request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
		      // Sends error message
		      res.json();
		 });
	}
});