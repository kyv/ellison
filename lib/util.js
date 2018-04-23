const isEmpty = require('lodash.isempty');
const defaults = require('lodash.defaults');
const mapValues = require('lodash.mapvalues');
const values = require('lodash.values');
const hash = require('object-hash');
const isUri = require('valid-url').isUri;
const timestamp = new Date().getTime();
const headers = [];
let rowNum = 1;
let row = {};

function httpOptions(url) {
  return Object.assign({
    uri: url,
  }, {
    headers: { 'Cache-Control': 'no-cache' },
    agentOptions: {
      rejectUnauthorized: false,
    },
  });
}

function formatResponse(req, res, url, type) {
  const mimeString = (type === 'csv') ? 'text/csv' : 'application/json';
  const typeString = `${mimeString}; charset=utf-8`;

  if (!isUri(url)) {
    res.json({
      error: 'invalid request',
    });
  }

  res.type(typeString);

  if (req.query.hasOwnProperty('attach')) {
    res.attachment(`compranet-${timestamp}.${type}`);
  }
}

function parseItem(item) {
  const attribs = item.attribs;
  const children = item.children;
  const value = children.is.children.t.value;
  const [c, r] = attribs.r.match(/[a-zA-Z]+|[0-9]+/g);

  return [value, c, +r];
}

function array2CSV(array) {
  return `"${array.join('", "')}"\r\n`;
}

function eachField(item, outputType, pubDate) {
  const [value, column, n] = parseItem(item);
  let hObj;

  if (n === 1) {
    // first row are headers
    headers.push({
      col: column,
      row: n,
      value,
    });
  }

  if (outputType === 'csv' && n === 2 && n > rowNum) {
    // send headers if we are outputing csv
    const h = headers.map(o => (o.value));

    hObj = h.reduce((acc, curr) => {
      acc[curr] = void 0;
      return acc;
    }, {});

    rowNum = n;
    return array2CSV(h);
  }

  if (n > 1) {
    // some row which is not headers
    const header = headers.filter(f => (f.col === column));
    const field = header[0].value;

    row[field] = value;
    if (n > rowNum) {
      rowNum = n;
      // we've shifted to a new row
      // init new and output old
      const completeRow = row;

      row = {};
      if (!isEmpty(completeRow)) {
        // always send all the fields, even undefined ones
        // this helps easily itentify all headers when using json
        // and data format when using CSV
        const filledIn = defaults(hObj, completeRow);

        if (outputType === 'csv') {
          return array2CSV(values(filledIn));
        }

        return {
          hash: hash(completeRow),
          httpLastModified: pubDate,
          body: mapValues(filledIn, v => {
            // map undefined to null to avoid getting stripped
            // by JSON.stringify (via process.send)
            if (typeof v === 'undefined') {
              return null;
            }
            return v;
          }),
        };
      }
    }
  }
  return null;
}

module.exports = {
  eachField,
  httpOptions,
  parseItem,
  formatResponse,
};
