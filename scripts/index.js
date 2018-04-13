const ACCESS_TOKEN = 'EAACEdEose0cBAKVPRjtijrjhC8c90rcPaKlpWwFfU4WPY0U3a9kKwD5LKE8TokwtHPDJWbsp3NDYOGO7xnR9OaxjgagXyBNwZCn124IqCi4VQhxlkYLPrQcYXtEBUTb21yvAujAPygxrqkkDpXAosZB2Hk7p849bSbXyqV7JAZCaH59zHPUGnRlqGmoRijDEbdSy0aPFG1Rft3s5zMR'

$(document).ready(function() {
  $.ajaxSetup({ cache: true });
  $.getScript('https://connect.facebook.net/en_US/sdk.js', function(){
    FB.init({
      appId: '',
      version: 'v2.12'
    });

    App.start();
  });
});

var App = {
  start: function() {
    this.fetch_post();
  },
  lookup_page: function(pagename) {
    var P = $.Deferred();
    FB.api(`/${pagename}`, {
      access_token: ACCESS_TOKEN,
      fields: 'id'
    }, function(response) {
      if (!response) {
        P.reject();
      };

      P.resolve(response.id);
    });

    return P.promise();
  },
  lookup_post: function(page_id, post_id) {
    FB.api(`/${page_id}_${post_id}`, {
      access_token: ACCESS_TOKEN,
      fields: 'attachments{media,description,title},message,full_picture,created_time,status_type'
    }, function(response) {
      if (!response) return;
      $('#post-body').text(response.message ? response.message : '');

      if (response.status_type == 'added_photos') {
        if (response.full_picture) {
          if ($('#post-attachment').length == 0) {
            $(`<div class='media' id='post-attachment'>
                  <img id='post-full_picture' />
                </div>`).insertAfter('#post-body');
            $('#post-full_picture').attr('src', `${response.full_picture}`);
          }
          else {
            $('#post-attachment').remove();
          }
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

          let attachment = response.attachments.data[0];
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
  },
  setup_post: function(post, affiliation) {
    var _this = this;
    $('div.post').attr('data-affiliation', affiliation);
    let post_url = new URL(post.permalink_url);
    let parts = post_url.pathname.split('/');
    let pagename = parts[1];
    let post_id = parts[parts.length - 1];

    this.lookup_page(pagename).then(function(page_id) {
      _this.lookup_post(page_id, post_id);
    });
  },
  fetch_post: function() {
    var _this = this;
    let topics = ['president-trump', 'health-care', 'guns', 'abortion', 'isis', 'budget', 'executive-order', 'immigration'];
    let topic_idx = Math.floor(Math.random() * topics.length);
    let page_num = Math.floor(Math.random() * 10) + 1;
    let affiliation = ['left', 'right'][Math.floor(Math.random() * 2)];
    let page_url = `http://graphics.wsj.com/blue-feed-red-feed/data.php?page=${page_num}&keyword=${topics[topic_idx]}`;
    let origin_workaround_url = `http://www.whateverorigin.org/get?url=${encodeURIComponent(page_url)}&callback=?`;

    $.getJSON(origin_workaround_url, function(data) {
      if (!data.contents) return;
      let contents = data.contents;
      let posts = contents[affiliation];

      let random_post = posts[Math.floor(Math.random() * posts.length)];
      _this.setup_post(random_post, affiliation);
    });
  }
}

// 120680396518_10155935754891519
