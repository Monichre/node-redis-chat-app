var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');
var creds = '';
var redis = require('redis');
var client = '';
var port = process.env.PORT || 8080;

//Express middleware for serving static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));


// Simply pass the port that you want a Redis server to listen on.


http.listen(port, function(){
    console.log("Listening on port: " + port);
});

var chatters = [];
var chat_messages = [];

fs.readFile('credentials/credentials.json', 'utf-8', function(err, data) {
    if(err) throw err;
    creds = JSON.parse(data);
    client = redis.createClient('redis://' + creds.user + ':' + creds.password + '@' + creds.host);

    client.once('ready', function(){
        client.flushdb();

        client.get('chat_users', function(err, reply) {
            if (reply) {
                chatters = JSON.parse(reply);
            }
        });

        client.get('chat_app_messages', function(err, reply) {
            if (reply) {
                chat_messages = JSON.parse(reply);
            }
        });
    });
});

// Routes
app.get('/', function(req, res) {
    res.send("Home page muthaaa fuckahhhh");
});
