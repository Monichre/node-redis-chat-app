var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var fs = require('fs');
var creds = '';
var redis = require('redis');
var client = '';
var port = process.env.PORT || 8080;

//Express middleware for serving static files
app.use(express.static(__dirname + '/public/'));
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
        console.log("in the redis client");
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

// ROUTES
// ================================================ **

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});
app.get('/chat', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/chat.html'));
});


// Joining the Chat Room
app.post('/join', function(req, res) {
    var username = req.body.username;
    if (chatters.indexOf(username) === -1) {
        chatters.push(username);
        client.set('chat_users', JSON.stringify(chatters));
        res.send({
            'chatters': chatters,
            'status': 'Ok'
        });
    } else {
        res.send({
            'status': "Failed"
        });
    }
});

// Leaving the Chat Room
app.post('/leave', function(req, res) {
    var username = req.body.username;
    chatters.splice(chatters.indexOf(username), 1);
    console.log(chatters);
    client.set('chat_users', JSON.stringify(chatters));
    res.send({
        'status': 'Ok',
        'chatters': chatters,
    });
});

// Sending and Storing Chat Messages
app.post('/send_message', function(req, res) {
    var username = req.body.username;
    var message = req.body.message;
    chat_messages.push({
        'sender': username,
        'message': message
    });
    client.set('chat_app_messages', JSON.stringify(chat_messages));
    res.send({
        'status': 'Ok'
    });
});

// Get Messages
app.get('/get_messages', function(req, res) {
    res.send(chat_messages);
    // I want to add this to get the chat page to render properly on the request response and load the appropriate chat data

    // var chatPage = path.join(__dirname + '/views/chat.html');
    // var data = {
    //     chat_messages: chat_messages
    // };
    //
    // res.sendFile(chatPage, data, function(err){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         console.log("Success!");
    //         console.log(data);
    //     }
    // });
});



// Get All Chat Members
app.get('/get_chatters', function(req, res) {
    res.send(chatters);
});

// Socket Connection for Front End UI
io.on('connection', function(socket) {
    console.log("Socket Connected");

    socket.on('message', function(data) {
        io.emit('send', data);
    });

    socket.on('update_chatter_count', function(data) {
        io.emit('count_chatters', data);
    });
});
