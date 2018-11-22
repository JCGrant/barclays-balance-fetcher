import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Credentials } from './node_modules/google-auth-library/build/src/auth/credentials';

const CREDENTIALS_PATH = './secrets/credentials.json';
const TOKEN_PATH = './secrets/token.json';

export function runCallback(callback: any, scopes: string[]) {
  const credentials = require(CREDENTIALS_PATH);
  authorize(credentials, scopes, callback);
}

function authorize(credentials: any, scopes: string[], callback: any) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  fs.readFile(TOKEN_PATH, (err, content) => {
    if (err) {
      return getNewToken(oAuth2Client, scopes, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(content.toString()));
    callback(oAuth2Client);
  });
}

function getNewToken(
  oAuth2Client: OAuth2Client,
  scopes: string[],
  callback: any
) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error(
          'Error while trying to retrieve access token',
          err
        );
      }
      if (token === null || token === undefined) {
        return console.error('token is null or undefined');
      }
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
