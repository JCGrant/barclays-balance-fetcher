import puppeteer from 'puppeteer';
import { updateSheet } from './google-sheets';

async function getRequestedMemorableWordCharacters(
  page: puppeteer.Page,
  memorableWord: string
): Promise<string[]> {
  const element = await page.$('#label-memorableCharacters');
  const text = await page.evaluate(element => element.textContent, element);
  const indices = [parseInt(text[6]) - 1, parseInt(text[14]) - 1];
  return indices.map(i => memorableWord[i]);
}

async function getBalance(page: puppeteer.Page): Promise<number> {
  await page.waitForSelector('.o-account__balance-head');
  const element = await page.$('.o-account__balance-head');
  const text = await page.evaluate(element => element.textContent, element);
  const balanceStr = text.trim().replace('£', '').replace(',', '');
  return parseFloat(balanceStr);
}

interface LoginDetails {
  surname: string;
  sortCode: string;
  accountNumber: string;
  passcode: string;
  memorableWord: string;
}

async function login(
  page: puppeteer.Page,
  { surname, sortCode, accountNumber, passcode, memorableWord }: LoginDetails
) {
  console.log('identifying...');
  console.log('typing surname...');
  await page.type('#surname0', surname);
  await page.click('#label-sortCode-main');
  console.log('typing sort code...');
  await page.type('#sortCode0', sortCode.slice(0, 2));
  await page.type('#sortCode1', sortCode.slice(2, 4));
  await page.type('#sortCode2', sortCode.slice(4, 6));
  await page.type('#sortCode3', accountNumber);
  await Promise.all([
    page.waitForSelector('#passcode0'),
    page.keyboard.press('Enter'),
  ]);

  console.log('authenticating...');
  console.log('typing passcode...');
  await page.type('#passcode0', passcode);
  const [c1, c2] = await getRequestedMemorableWordCharacters(
    page,
    memorableWord
  );
  console.log('entering memorable word characters...');
  const radioDropdowns = await page.$$('#selectedCharacter');
  await radioDropdowns[0].click();
  await page.keyboard.type(c1);
  await radioDropdowns[1].click();
  await page.keyboard.type(c2);
  await page.waitFor(100);
  await Promise.all([
    page.waitForNavigation(),
    page.click('#btn-login-authSFA'),
  ]);
}

const BANK_LOGIN_PATH = './secrets/bank-login.json';

const BARCLAYS_LOGIN_URL =
  'https://bank.barclays.co.uk/olb/authlogin/loginAppContainer.do';

async function main() {
  const browser = await puppeteer.launch({
    //headless: false,
    //slowMo: 250,
  });
  const page = await browser.newPage();
  await page.goto(BARCLAYS_LOGIN_URL, { waitUntil: 'networkidle2' });
  console.log('logging in...');
  await login(page, require(BANK_LOGIN_PATH));
  console.log('getting balance...');
  const balance = await getBalance(page);
  console.log('balance:', balance);
  await browser.close();
  console.log('updating sheet...');
  updateSheet(balance);
}

main();
