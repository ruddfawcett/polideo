const app = require('./app');

const port = process.env.PORT || 8080
const host = process.env.HOST || 'localhost';

const server = app.listen(port);

server.on('listening', () => {
  console.log(`Polideo is live on ${host}:${port}...`)
});
