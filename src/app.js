const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');

const routes =  require('./routes/')

var express = require('express');
var app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(compress());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(favicon(path.join(__dirname, '../public/assets/images/favicon.ico')));
app.options('*', cors());

app.use(
  sass({
    src: path.join(__dirname, '../public/assets/sass/'),
    dest: path.join(__dirname, '../public/assets/styles/'),
    debug: false,
    force: true,
    outputStyle: 'compressed',
    prefix: '/static/assets/styles/'
  })
);

app.use('/static', express.static(path.join(__dirname, '../public')));

app.get('/test', )

app.get('*', (req, res, next) => {
  res.render('404', { status: 404, url: req.url });
});

module.exports = app;
