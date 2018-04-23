const rfbf = require('../util/rfbf');

module.exports = {
  get: function(req, res, next) {
    var posts = rfbf.get(0).then(rfbf.find_page).then(rfbf.match_post).then((data) => {
      return res.render('test', {
        posts: data
      });
    });
  }
}
