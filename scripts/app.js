const APP_ID = ''
const ACCESS_TOKEN = 'EAACEdEose0cBAITvZA8wK7nu7Hetg2ZAbqNJHnqSXNn0KGWlegGJu5ymp0bhsDUgg2CyI2KHhwphkhCeBc9kZBmtsO0KTPiuOdZCZANrzZC8uYjT3JZB3HXIwcZAcoZA4z2j7drAyJ0l707T6suU0oOCp92ZByloHtDlE3ZBuoP4dNWqx9hhwgBPF2jRw5uE82wnBRoLD8VqHx7MX7ZB0r7ISNnD'

const POST_TOPICS = ['president-trump', 'health-care', 'guns', 'abortion', 'isis', 'budget', 'executive-order', 'immigration'];
const POINT_VALUES = {
  'like': 1,
  'comment': 3,
  'share': 5,
  'ignore': 0
}

var App = {
  start: function() {
    var _this = this;

    this.db = TAFFY();
    this.should_insert = false;

    $('.action').on('click', function() {
      _this.handle_action(this);
    });

    $.ajaxSetup({ cache: true });
    $.getScript('https://connect.facebook.net/en_US/sdk.js', function(){
      FB.init({
        appId: APP_ID,
        version: 'v2.12'
      });

      _this.fetch_post();
    });
  },
  handle_action: function(node) {
    if (!this.should_insert) return;
    this.should_insert = false;

    var _this = this;

    let action_tag = $(node).data('action');
    let post = $('#fb-post');
    let alignment = post.attr('data-alignment');

    let sign = alignment == 'left' ? -1 : 1;
    let dp = sign * POINT_VALUES[action_tag];

    let index = 1;
    let point_value = dp;

    let last_entry = this.db().last();

    if (last_entry) {
      index = last_entry.index + 1;
      point_value = last_entry.point_value + dp;
    }

    var row = {
      'index': index,
      'alignment': alignment,
      'dp': dp,
      'point_value': point_value,
      'post': post.attr('data-permalink_url'),
      'post_source': post.attr('data-from')
    }

    if (this.db.insert(row)) {
      this.insert_row(row);
      this.fetch_post();
    }
    else {
      this.should_insert = true;
    }
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
    var _this = this;
    FB.api(`/${page_id}_${post_id}`, {
      access_token: ACCESS_TOKEN,
      fields: 'attachments{media,description,title},message,full_picture,created_time,status_type'
    }, function(response) {
      if (!response) return;
      _this.should_insert = true;

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
        if (response.attachments && response.attachments.data.length > 0) {
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
          _this.fetch_post();
          $('#post-attachment').remove();
        }
      }
    });
  },
  insert_row: function(row) {
    $('#record tr:last').after(`
      <tr>
        <td>${row.index}</td>
        <td>${row.alignment}</td>
        <td>${row.dp}</td>
        <td>${row.point_value}</td>
        <td><a href='${row.post}'>Link</a></td>
        <td>${row.post_source}</td>
      </tr>`);
  },
  setup_post: function(post, alignment) {
    var _this = this;
    $('div.post').attr('data-alignment', alignment);
    $('div.post').attr('data-permalink_url', post.permalink_url);
    $('div.post').attr('data-from', post.from);

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

    let topic_idx = Math.floor(Math.random() * POST_TOPICS.length);
    let page_num = Math.floor(Math.random() * 10) + 1;
    let alignment = ['left', 'right'][Math.floor(Math.random() * 2)];
    let page_url = `http://graphics.wsj.com/blue-feed-red-feed/data.php?page=${page_num}&keyword=${POST_TOPICS[topic_idx]}`;
    let origin_workaround_url = `http://www.whateverorigin.org/get?url=${encodeURIComponent(page_url)}&callback=?`;

    $.getJSON(origin_workaround_url, function(data) {
      if (!data.contents) return;
      let contents = data.contents;
      let posts = contents[alignment];

      let random_post = posts[Math.floor(Math.random() * posts.length)];
      _this.setup_post(random_post, alignment);
    });
  }
}
