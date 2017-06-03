// Ajax Events for Front End UI
$.get('/get_chatters', function(response) {
    $('.chat-info').text('There are currently ' + response.length + ' people in the chat room');
    chatter_count = response.length;
});

// Joining the Chatroom
$('#join-chat').click(function(e){
    e.preventDefault();
    var user_name = $('#user_name').val();
    console.log(user_name);
});
