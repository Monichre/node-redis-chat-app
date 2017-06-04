$(function(){

    var socket = io();

    // Ajax Events for Front End UI
    $.get('/get_chatters', function(response) {
        console.log(response);
        $('.chat-info').append("<div class='col s12 animated slideInRight'> <div class='card-panel red z-depth-5'>" +
                "<div class='row valign-wrapper'>" +
                    "<div class=''><i class='small material-icons white-text'>perm_identity</i></div>" +
                    "<div class=''><span class='white-text'>" + 'There are currently ' + response.length + ' people in the chat room' + "</span></div>" +
                "</div>" +
                "</div>" +
                "</div>");
        chatter_count = response.length;
        var chatters = response;
        chatters.forEach(function(chatter) {
            $('.friends').append("<a href='#'><div class='chip red z-depth-5 white-text'><i class='small material-icons white-text circle'>perm_identity</i>" + chatter +  "</div></a>");
        });
    });

    // Joining the Chatroom
    $('#join-chat').click(function(e){
        e.preventDefault();
        var username = $('#username').val();

        localStorage.setItem('username', username);

        $.ajax({
            url: '/join',
            type: 'POST',
            data: {
                username: username
            },
            success: function(response) {
                if(response.status === 'Ok') {

                    window.location.href = '/chat';
                    socket.emit('update_chatter_count', {
                        'action': 'increase'
                    });
                } else if (response.status === 'Failed') {
                    alert("Sorry but that username already exists");
                    $('#username').val('').focus();
                } else {
                    alert("Some sort of error occured");
                }
            }
        });
    });

    $('#leave-chat').click(function(){
        var username = $(this).attr('data-username');

        $.ajax({
            url: '/leave',
            type: 'POST',
            dataType: 'json',
            data: {
                username: username
            },
            success: function(response){
                if (response.status === "Ok") {
                    socket.emit('message', {
                        'username': username,
                        'message': username + " has left the chat room.."
                    });
                    socket.emit('update_chatter_count', {
                        'action': 'decrease'
                    });
                    $('.chat').addClass("animated slideOutDown");
                    $('.join-chat').addClass("animated fadeInUp");
                    $('#username').val('');
                    alert(username + ", you've successfully left the chatroom");
                }
            }
        })
    });

    $('#send-message').click(function(e){
        e.preventDefault();
        var username = $(this).attr('data-username');
        var message = $('#message').val();

        console.log(message);

        $.ajax({
            url: '/send_message',
            type: "POST",
            dataType: 'json',
            data: {
                'username': username,
                'message': message
            },
            success: function(response){
                if (response.status === "Ok") {
                    console.log(response);

                    socket.emit('message', {
                        'username': username,
                        'message': message
                    });
                $('#message').val('');
                }
            }
        })
    });

    //This code is Socket.io listening for a socket response on the backend server that it in turn received from our Send Message Click
    socket.on('send', function(data) {
        var username = data.username;
        var message = data.message;
        console.log(data);

        var html = "<li class='collection-item avatar message animated fadeInUp'>" +
            "<i class='small material-icons circle blue'>perm_identity</i>" +
            "<span class='title'>" + username + "</span> <br>" +
            "<p>" + message + "</p> <a href='#' class='secondary-content'><i class='material-icons'>grade</i></a></li>";

        $('.messages').append(html);
    });
    socket.on('count_chatters', function(data) {
        if (data.action === 'increase') {
            chatter_count++;
        } else {
            chatter_count--;
        }
        $('.chat-info').append("<div class='col s12 animated slideInRight'> <div class='card-panel red z-depth-5'>" +
                "<div class='row valign-wrapper'>" +
                    "<div class=''><i class='small material-icons white-text'>perm_identity</i></div>" +
                    "<div class=''><span class='white-text'>" + 'There are currently ' + chatter_count + ' people in the chat room' + "</span></div>" +
                "</div>" +
                "</div>" +
                "</div>");

    });

});
