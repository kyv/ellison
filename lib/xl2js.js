/* eslint new-cap: ["error", { "capIsNewExceptions": ["ParseOne"] }] */
const unzip = require('unzipper');
const saxStream = require('sax-stream');
const request = require('request');
const URL = require('url');
const eachField = require('./util').eachField;
const httpOptions = require('./util').httpOptions;
const miss = require('mississippi');
const unzipWorksheet = unzip.ParseOne(/xl\/worksheets\/sheet1.xml/);
const urlString = process.argv[2];
const outputType = process.argv[3];
const unzipExcel = unzip.ParseOne(/Contratos.*\.xlsx/i);
const url = URL.parse(urlString);
const options = httpOptions(url);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function done(err) {
  process.stderr.write(err);
}

const saxOptions = {
  strict: true,
  tag: 'c',
  trim: true,
  normalize: true,
  resume_saxerror: true,
  // highWaterMark: 1,
};
const xmlStream = saxStream(saxOptions);

xmlStream.on('error', e => {
  process.stderr.write('error!', e);
});

miss.pipe(
  request.get(options),
  unzipExcel,
  unzipWorksheet,
  xmlStream,
  done
);

xmlStream.on('data', item => {
  const doc = eachField(item, outputType);

  if (doc) {
    if (outputType === 'csv') {
      process.send(doc.toString());
    } else {
      process.send(JSON.stringify(doc));
    }
  }
});
