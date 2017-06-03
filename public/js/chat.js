$(function(){

    var socket = io();

    // Ajax Events for Front End UI
    $.get('/get_chatters', function(response) {
        $('.chat-info').text('There are currently ' + response.length + ' people in the chat room');
        chatter_count = response.length;
    });

    // Joining the Chatroom
    $('#join-chat').click(function(e){
        e.preventDefault();
        var username = $('#username').val();
        console.log(username);
        localStorage.setItem('username', username);

        $.ajax({
            url: '/join',
            type: 'POST',
            data: {
                username: username
            },
            success: function(response) {
                if(response.status === 'Ok') {
                    alert("AJAX call successful");
                    console.log(response);
                    window.location = 'http://localhost:8080/chat';
                    socket.emit('update_chatter_count', {
                        'action': 'increase'
                    });
                    
                    $.get('/get_messages', function(response) {
                        var message_count = response.length;
                        if(message_count > 0) {
                            // var message_count = response.length;
                            var html = '';
                            for(var x = 0; x < message_count; x ++){
                                html += "<div class='message'><span class='username-title'></span>" + response[x] + "</div>";
                            }
                            $('.messages').html(html);
                        } else if (message_count === 0) {
                            $('.messages').append("<h1>There are currently no messages</h1>");
                        }
                    });
                    $('#join-chat').hide();
                } else if (response.status === 'Failed') {
                    alert("Sorry but that username already exists");
                    $('#username').val('').focus();
                } else {
                    alert("Some sort of error occured");
                }
            }
        });
    });


});
