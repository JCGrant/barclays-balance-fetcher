# Barclays Balance Fetcher
Scrape current balance from Barclays and append to a Google Spreadsheet

## Setup

```
git clone git@github.com:JCGrant/barclays-balance-fetcher.git
cd barclays-balance-fetcher

mkdir secrets

cat << EOT > bank-login.json
{
  "surname": "XXXXX",
  "sortCode": "XXXXXX",
  "accountNumber": "XXXXXXXX",
  "passcode": "XXXXX",
  "memorableWord": "XXXXXXXXXXXXXXX"
}
EOT

cat << EOT > spreadsheet-details.json
{
  "id": "XXXXXXXXXXXXXXXXXXXX",
  "appendColumns": ["X", "X"]
}
EOT
```

Follow [this guide](https://developers.google.com/sheets/api/quickstart/nodejs). You will create a Google Project and obtain a `credentials.json`. Put this inside the `secrets` folder.

```
$ ls secrets
bank-login.json  credentials.json  spreadsheet-details.json
```

`bank-login.json` will look like:

```
{
  "surname": "XXXXX",
  "sortCode": "XXXXXX",
  "accountNumber": "XXXXXXXX",
  "passcode": "XXXXX",
  "memorableWord": "XXXXXXXXXXXXXXX"
}
```

Where each field should be fairly self explanatory.

`spreadsheet-details.json` will look like:

```
{
  "id": "XXXXXXXXXXXXXXXXXXXX",
  "appendColumns": ["X", "X"]
}
```

Where:

- `id` is id of your spreadsheet, found in the url of your sheet: https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXX/edit#gid=0
- `appendColumns` is a list of columns you want the balances to be added to each time you run the script. This must be less than or equal to the number of accounts you have.

Edit the all the fields with your respective values.

Run the code:

```
tsc && node index.js
```

It will ask you to copy a URL to your browser and copy a code back into the terminal. You may also get a warning from Google that the Project is unverified. However this is the Google Project you just created above, so feel free to happily ignore this and give the necessary permissions. A `tokens.json` will appear in your secrets folder. You won't have to repeat this step again on subsequent runs.
