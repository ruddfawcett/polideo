var Promise = require('bluebird');
var Graph = require('fbgraph');
Promise.promisifyAll(Graph);

var request = require('request-promise');
var url = require('url');

Graph.setAccessToken('EAACEdEose0cBAOuJIqnJzp6MHRHJpzJOCy00ZCGRZBbrJzj8OiXSfBcWu4PS7dwDI1hY2jcFiLDsfVWEXsgWhnp2Lt6rYuCqncniwx4A28fGEmX0pYr4qfZAcNefqQ0mJcZC2q90U9yKKhI1iKGn2lwdJmZCSCvZAfG2NyHz2jmT1wMJ1auUhSd4lsZBnxqoKnwasRuBKaWklCvsz1wvhVM');

const POST_TOPICS = ['president-trump', 'health-care', 'guns', 'abortion', 'isis', 'budget', 'executive-order', 'immigration'];

module.exports = {
  get: (count) => {
    var tURL = () => {
      let topic_idx = Math.floor(Math.random() * POST_TOPICS.length);
      let topic = POST_TOPICS[topic_idx];
      let page_num = Math.floor(Math.random() * 10) + 1;

      return [
        `http://graphics.wsj.com/blue-feed-red-feed/data.php?page=${page_num}&keyword=${topic}`,
        topic
      ];
    }

    var requests = [];
    for (var i = 1; i <= count; i++) {
      let tuple = tURL();
      requests.push({
        url: tuple[0],
        topic: tuple[1]
      });
    }

    return Promise.map(requests, (obj) => {
      return request(obj).then((body) => {
        let alignment = ['left', 'right'][Math.floor(Math.random() * 2)];

        var response = JSON.parse(body);
        let posts = response[alignment].filter((post) => {
          return post.permalink_url.indexOf('videos') == -1;
        });

        var post = posts[Math.floor(Math.random() * posts.length)];

        let post_url = url.parse(post.permalink_url);
        let parts = post_url.pathname.split('/');
        let pagename = parts[1];
        let post_id = parts[parts.length - 1];

        delete post.picture;
        delete post.permalink_url;

        post.alignment = alignment;
        post.topic = obj.topic;
        post.pagename = pagename;
        post.post_id = post_id;

        return post;
      });
    });
  },
  find_page: (posts) => {
    return Promise.map(posts, (post) => {
      return Graph.getAsync(post.pagename, { fields: '' }).then((res) => {
        post.page_id = res.id;
        return post;
      });
    });
  },
  match_post: (posts) => {
    return Promise.map(posts, (post) => {
      return Graph.getAsync(`${post.page_id}_${post.post_id}`, {
        fields: 'attachments{media,description,title, url},message,full_picture,created_time,status_type'
      }).then((response) => {
        var data = {};

        data.message = response.message ? response.message : '';

        if (response.status_type == 'added_photos') {
          if (response.full_picture) {
            data.full_picture = response.full_picture ? response.full_picture : '';
          }
        }
        else {
          if (response.attachments && response.attachments.data.length > 0) {
            let attachment = response.attachments.data[0];
            data.full_picture = response.full_picture ? response.full_picture : '';
            data.attachment = {};

            data.attachment.title = attachment.title ? attachment.title : '';
            data.attachment.description = attachment.description ? attachment.description : '';
          }
        }

        post.data = data;

        return post;
      });
    });
  }
}
