import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { runCallback } from './google-auth';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_DETAILS_PATH = './secrets/spreadsheet-details.json';

export function updateSheet(balance: number) {
  const callback = (auth: OAuth2Client) => {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetDetails = require(SPREADSHEET_DETAILS_PATH);
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: spreadsheetDetails.id,
        range: `Sheet1!${spreadsheetDetails.appendColumn}1`,
        valueInputOption: 'RAW',
        resource: {
          values: [[balance]],
        },
      },
      (err: Error, res: any) => {
        if (err) {
          console.log('The API returned an error: ' + err);
        } else {
          console.log(`updated cell: ${res.data.updates.updatedRange}`);
        }
      }
    );
  };
  runCallback(callback, SCOPES);
}
