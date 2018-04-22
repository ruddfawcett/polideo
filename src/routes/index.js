var test = require('./test');

module.exports = function(router) {
  router.use(function(req, res, next) {
    next();
  });

  router.get('/test', test.get);

  router.use('*', function(req, res) {
    res.status(404).render('404');
  });

  return router;
}
