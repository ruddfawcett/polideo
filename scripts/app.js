const APP_ID = '503600090034639';
const ACCESS_TOKEN = 'EAACEdEose0cBAAneK7Trh6ZCMJMDPHEBF9RNgdAMwAqLQ49F7Qd2FKOLjBM8elC7mMXzRzbQG5763ZAY7uNCUNYYVCFuZCKCg7EbYJHUroXbCZC2GduYzksRh368wyziBpKGVXYdZALFfivUZABzsowaQkfp8TudJrKyCJzXeBYymNwXNvDFVQzIZCZC9IvSjNiZAiZBGEP0DYi2iQKP5Nxs92';

const TESTING_MATH = true;

const POST_TOPICS = ['president-trump', 'health-care', 'guns', 'abortion', 'isis', 'budget', 'executive-order', 'immigration'];
const POINT_VALUES = {
  vds: -2,
  ds: -1,
  n: 0,
  s: 1,
  vs: 2
}

var App = {
  start: function() {
    var _this = this;

    this.db = TAFFY();
    this.should_insert = false;

    $('.action').on('click', function() {
      _this.handle_action(this);
    });

    $('.reveal-text').on('mouseover', function() {
      if ($(this).attr('data-actual')) {
        $(this).text($(this).attr('data-actual'));
      }
    }).on('mouseout', function() {
        $(this).text($(this).attr('data-default'));
    });

    if (TESTING_MATH) {
      return _this.fetch_post();
    }

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
    if (!TESTING_MATH) {
      if (!this.should_insert) return;
      this.should_insert = false;
    }

    var _this = this;

    let action_tag = $(node).data('action');
    let post = $('#fb-post');
    let alignment = post.attr('data-alignment');
    let topic = post.attr('data-topic');

    // scale
    // liberal post
    // -2， -1， 0， 1， 2
    console.log(alignment);
    let sign = alignment == 'left' ? -1 : 1;
    let RV = sign * POINT_VALUES[action_tag];

    let index = 1;
    let engagement_value = RV;

    let last_entry = this.db().last();

    // Initial P value as a raio of your engagement value * a constant.
    var AV = RV * 0.05;

    if (last_entry) {
      index = last_entry.index + 1;
      engagement_value = last_entry.RV_sum + RV;
      AV = this.calculate(RV, last_entry.AV);
    }

    let ideology = this.qualify_ideology(AV);

    var row = {
      'index': index,
      'alignment': alignment,
      'topic': topic,
      'RV': RV,
      'RV_sum': engagement_value,
      'AV': AV,
      'post': post.attr('data-permalink_url'),
      'post_source': post.attr('data-from'),
      'qualified_ideology': ideology
    }

    if (this.db.insert(row)) {
      var _this = this;
      function point(isRV) {
        return {
          x: _this.db().count(),
          y: isRV ? RV : AV,
          alignment: alignment,
          topic: topic,
          post_source: post.attr('data-from')
        }
      }

      graph.series[0].addPoint(point(true));
      graph.series[1].addPoint(point(false));

      this.insert_row(row);
      this.update_overview(ideology);
      this.fetch_post();
    }
    else {
      this.should_insert = true;
    }
  },
  calculate: function(RV, AV) {
    let totN = this.db().count();
    let lN = this.db({alignment: 'left'}).count();
    let rN = this.db({alignment: 'right'}).count();

    let lsumRV = this.db({alignment: 'left'}).sum('RV');
    let rsumRV = this.db({alignment: 'right'}).sum('RV');

    var lAR = PMath.AR(lN, totN);
    var rAR = PMath.AR(rN, totN);

    var lAE = PMath.AE(lAR, lsumRV);
    var rAE = PMath.AE(lAE, rsumRV);

    let IA = (Math.abs(lAE) <= Math.abs(rAE)) ? PMath.IA(lAE, rAE) : PMath.IA(rAE, lAE);
    let nAV = PMath.fAV(IA, RV, AV);

    return nAV;
  },
  qualify_ideology: function(AV) {
    if (Math.abs(AV) < 0.2) return 'centrist';
    if (AV < -0.7) return 'very liberal';
    if (AV < -0.4) return 'liberal';
    if (AV < -0.2) return 'moderately liberal';
    if (AV <= 0.4) return 'moderately conservative';
    if (AV <= 0.7) return 'conservative';
    if (AV <= 1.0) return 'very conservative';
  },
  lookup_page: function(pagename) {
    var P = $.Deferred();
    FB.api(`/${pagename}`, {
      access_token: ACCESS_TOKEN
    }, function(response) {
      if (!response) {
        P.reject();
      };

      $('#post-page').attr('data-actual', response.name);

      P.resolve(response.id);
    });

    return P.promise();
  },
  lookup_post: function(page_id, post_id) {
    var _this = this;
    FB.api(`/${page_id}_${post_id}`, {
      access_token: ACCESS_TOKEN,
      fields: 'attachments{media,description,title, url},message,full_picture,created_time,status_type'
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
                    <h1 id='post-attachment-title'>Mei elitr RVeriri rationibus id nulla expetenda pro ad</h1>
                    <p id='post-attachment-description'>Ea his partem erroribus, est ea labore utroque delectus, sea meliore platonem ut. Ex odio diam voluptatibus sea, doming mollis civibus ea nec.</p>
                    <h6 class='reveal-text' id='post-attachment-source' data-default='website.com'>website.com</h6>
                  </div>
                </div>`).insertAfter('#post-body');
          }

          let attachment = response.attachments.data[0];
          $('#post-attachment-title').text(attachment.title ? attachment.title : '');
          $('#post-attachment-description').text(attachment.description ? attachment.description : '');

          let attachment_url = new URL(attachment.url);
          let encoded_uri = attachment_url.search.replace('?u=', '');
          let decoded =  decodeURIComponent(encoded_uri);
          let url = new URL(decoded);
          let hostname_parts = url.hostname.split('.');
          let website = hostname_parts[hostname_parts.length - 2] + '.' + hostname_parts[hostname_parts.length - 1];

          $('#post-attachment-source').attr('data-actual', website);

          $('#post-attachment').on('click', function() {
            window.open(url, '_blank');
          });

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
    let row_count = this.db().count();

    if (row_count > 10) {
      if ($('#record tr.inserted-row.overflow').length != 1) {
        $('#record tr:first').after(`
          <tr class='inserted-row overflow'>
            <td>&hellip;</td>
            <td>&hellip;</td>
            <td>&hellip;</td>
            <td>&hellip;</td>
            <td>&hellip;</td>
            <td>&hellip;</td>
            <td>&hellip;</td>
          </tr>`);
      }

      $('#record tr.inserted-row')[1].remove();
    }

    $('#record tr:last').after(`
      <tr class='inserted-row'>
        <td>${row.index}</td>
        <td>${row.alignment}</td>
        <td>${row.topic}</td>
        <td>${row.RV}</td>
        <td>${row.AV}</td>
        <td><a href='${row.post}'>Link</a></td>
        <td>${row.post_source}</td>
      </tr>`);
  },
  update_overview: function(ideology) {
    $('.qualified-ideology').text(ideology);

    function f(n) {
      return n;
    }

    let nTot = this.db().count();
    let lN = this.db({alignment: 'left'}).count();
    let rN = this.db({alignment: 'right'}).count();

    let likeN = this.db({RV: [-1, 1]}).count();
    let commentN = this.db({RV: [-3, 3]}).count();
    let shareN = this.db({RV: [-5, 5]}).count();
    let ignoreN = this.db({RV: 0}).count();

    $('.post-count').text(f(nTot));
    $('.post-count-liberal').text(f(lN));
    $('.post-count-conservative').text(f(rN));

    $('.post-count-like').text(f(likeN));
    $('.post-count-comment').text(f(commentN));
    $('.post-count-share').text(f(shareN));
    $('.post-count-ignore').text(f(ignoreN));

    $('.post-percent-conservative').text(((rN / nTot) * 100).toFixed(1) + '%');
    $('.post-percent-liberal').text(((lN / nTot) * 100).toFixed(1) + '%');
  },
  setup_post: function(post, alignment, topic) {
    var _this = this;
    $('div.post').attr('data-alignment', alignment);
    $('div.post').attr('data-topic', topic);
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
    let alignment = ['left', 'right'][Math.floor(Math.random() * 2)];

    if (TESTING_MATH) {
      $('div.post').attr('data-alignment', alignment);
      $('div.post').removeClass('left');
      $('div.post').removeClass('right');
      $('div.post').addClass(alignment);
      $('#post-body').html('In testing mode, no calls to the Facebook API are made. <br /><br />A post with a blue background color is &ldquo;left,&rdquo; and one with the red background color is &ldquo;right.&rdquo;');
      return;
    }

    let topic_idx = Math.floor(Math.random() * POST_TOPICS.length);
    let topic = POST_TOPICS[topic_idx];
    let page_num = Math.floor(Math.random() * 10) + 1;
    let page_url = `http://graphics.wsj.com/blue-feed-red-feed/data.php?page=${page_num}&keyword=${topic}`;
    let origin_workaround_url = `http://www.whateverorigin.org/get?url=${encodeURIComponent(page_url)}&callback=?`;

    $.getJSON(origin_workaround_url, function(data) {
      if (!data.contents) return;
      let contents = data.contents;
      let posts = contents[alignment];

      let random_post = posts[Math.floor(Math.random() * posts.length)];
      _this.setup_post(random_post, alignment, topic);
    });
  }
}
