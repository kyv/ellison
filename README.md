# ellison (excel2json)

[COMPRANET](https://sites.google.com/site/cnetuc/contrataciones) streaming json proxy.

https://excel2json.herokuapp.com/

### This should stream [NDJSON](http://specs.okfnlabs.org/ndjson/) to your browser
https://excel2json.herokuapp.com/https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip

Documents will be of the following format.

    {
      "hash": "cf11ed17712ea4c01e5d0be6098135d6b9d04dbe",
      "body": {
        ... some fields from the data source ...
      }
    }

#### The same using curl instead of the browser

    curl https://excel2json.herokuapp.com/https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip

### If you prefer csv
https://excel2json.herokuapp.com/https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip?csv

### If you want to save the csv to a file
That's great for communication between applications, but if you are a human being you
might prefer to stream that data to a local file. Then you could open it in libreoffice
or something like that.

https://excel2json.herokuapp.com/https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip?csv&attach

#### The same but with curl

    curl https://excel2json.herokuapp.com/https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip?csv > compranet-2013.csv


# Data wrangling with [`curl` and `jq`](http://www.compciv.org/recipes/cli/jq-for-parsing-json/)

## Get a stream of object hashes
Maybe useful for finding duplicate content.

    curl -s 'https://excel2json.herokuapp.com/https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip?json' | jq '.hash'

You should get a stream of strings resembling the following.

    "1d8b8136aafad5b4b7ee772c147a5b03a515c137"
    "a9b4dfe31e920c6874201a863326557660f1c881"
    "ed877f9ce2736759bc95bd3029fe3bbc1e6a2139"
    "b6d8fc547bcd85942da09ddb80ee3c7bcb78ad0e"

Those are the object hashes of the original COMPRANET documents.

## Filter the `body` subobject to stream only the SIGLAS field

    curl -s 'https://excel2json.herokuapp.com/https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip?json' | jq '.body.SIGLAS'

## Or maybe you just want to see what the headers for a given file

    curl -s 'https://excel2json.herokuapp.com/https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip?csv' |head -n 1

## Or maybe you just want the number of headers

    curl -s 'https://excel2json.herokuapp.com/https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip?csv' |head -n 1 | wc -w

Note this only works on headers as column values may contain spaces.
