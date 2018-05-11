const test = require('./test');
const rfbf = require('../util/rfbf');

module.exports = function(router) {
  router.use(function(req, res, next) {
    next();
  });

  router.get('/', (req, res, next) => {
    return res.render('index-legacy');
  });

  router.get('/test', test.get);

  router.get('/posts/:count', (req, res, next) => {
    var posts = rfbf.get(req.params.count).then(rfbf.find_page).then(rfbf.match_post).then((data) => {
      res.json(data);
    });
  });

  router.use('*', function(req, res) {
    res.status(404).render('404');
  });

  return router;
}
