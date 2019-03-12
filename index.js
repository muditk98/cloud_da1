const request = require('request');
const path = require('path');
const events = require('events');
// const http = require('http');
// const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

let key = process.env.steam_key;

let steam_id = '';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function getPlayerDetails(player_id, app_res) {
	let url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${player_id}`;
	request(url, (err, res, body) => {
		if (err) throw err;
		body = JSON.parse(body);
		player = body.response.players[0];
		console.log(player);
		let personastate = ['offline', 'online', 'busy', 'away', 'snooze', 'looking to trade', 'looking to play'][player.personastate];
		app_res.send(`<p>${player.personaname}</p>` + 
			`<img src=${player.avatarfull}/>` + 
			`<p> Last online: ${Date(player.lastlogoff)}</p>` + 
			`<p> Currently: ${personastate} </p>`);
	})

}



app.post('/', (req, app_res) => {
    // console.log(req);
    player_id = req.body.player_id;
    if(!/^\d{17}$/.test(player_id)) {
        let vanity_user_url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${player_id}`;
        request(vanity_user_url, (err, res, body) => {
            if (err) throw err;
            body = JSON.parse(body);
            if (body.response.success == 42) {
                app_res.send('Invalid username/id');
            }
            else {
				player_id = body.response.steamid;
				getPlayerDetails(player_id, app_res);
            }
            
		})
	}
	else {
		getPlayerDetails(player_id, app_res);
	}	
})

if (key) {
	let port = process.env.port || 3000;
	app.listen(port);
	console.log(`Server running on port: ${port}`);
} else {
	console.log('key undefined');
}
