/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const express = require('express');
const app = express();
const cp = require('child_process');
const formatResponse = require('./lib/util').formatResponse;
const port = process.env.PORT || 9000;
const router = express.Router();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

router.get('/:fileUrl*', (req, res) => {
  const path = req.params[0];
  const proto = req.params.fileUrl;
  const urlString = `${proto}${path}`;
  let outputType = 'json';

  if (req.query.hasOwnProperty('csv')) {
    outputType = 'csv';
  }

  formatResponse(req, res, urlString, outputType);
  const n = cp.fork('./lib/xl2js.js', [urlString, outputType]);

  n.on('message', m => {
    res.write(m);
  });

  req.on('close', () => {
    n.kill('SIGHUP');
  });
});

app.use('/', router);
app.listen(port);
process.stdout.write(`port: ${port}\n`);
