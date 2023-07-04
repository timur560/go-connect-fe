const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: `${__dirname}/.env` });

const BUILD_PATH = '/home/ubuntu/opf_admin/build';

const options = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH),
};

app.use(express.static(BUILD_PATH));

app.all('*', function (req, res) {
  res.sendFile(`${BUILD_PATH}/index.html`);
});

https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
