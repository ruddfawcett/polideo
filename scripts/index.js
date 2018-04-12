const ACCESS_TOKEN = '';

$(document).ready(function() {
  $.ajaxSetup({ cache: true });
  $.getScript('https://connect.facebook.net/en_US/sdk.js', function(){
    FB.init({
      appId: '{your-app-id}',
      version: 'v2.7'
    });

    fetch_post();
  });
});

function fetch_post() {
  FB.api('/ID', {
    access_token: ACCESS_TOKEN,
    fields: 'attachments{media,description,title},message,full_picture,created_time,status_type'
  }, function(response) {
    console.log(response);
    $('#post-body').text(response.message ? response.message : '');

    if (response.status_type == 'added_photos') {
      if (response.full_picture) {
        $(`<div class='media' id='post-attachment'>
              <img id='post-full_picture' />
            </div>`).insertAfter('#post-body');
        $('#post-full_picture').attr('src', `${response.full_picture}`);
      }
    }
    else {
      if (response.attachments.data.length > 0) {
        if ($('#post-attachment').length == 0) {
          $(`<div class='media' id='post-attachment'>
                <div class='image' id='post-full_picture'></div>
                <div class='deck'>
                  <h1 id='post-attachment-title'>Mei elitr aperiri rationibus id nulla expetenda pro ad</h1>
                  <p id='post-attachment-description'>Ea his partem erroribus, est ea labore utroque delectus, sea meliore platonem ut. Ex odio diam voluptatibus sea, doming mollis civibus ea nec.</p>
                  <h6 id='post-attachment-source'>website.com</h6>
                </div>
              </div>`).insertAfter('#post-body');
        }

        var attachment = response.attachments.data[0];
        $('#post-attachment-title').text(attachment.title ? attachment.title : '');
        $('#post-attachment-description').text(attachment.description ? attachment.description : '');

        if (response.full_picture) {
          $('#post-full_picture').css('background-image', `url(${response.full_picture})`);
        }
      }
      else {
        $('#post-attachment').remove();
      }
    }
  });
}
