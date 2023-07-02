const express = require('express');
const app = express();
const http = require('http');
require('dotenv').config({ path: `${__dirname}/.env` });

const BUILD_PATH = '/home/ubuntu/go_connect_web/build';

app.use(express.static(BUILD_PATH));

app.all('*', function (req, res) {
  res.sendFile(`${BUILD_PATH}/index.html`);
});

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
