const puppeteer = require("puppeteer");
const path = require("path");
const fs = require('fs');
const directory = './screenshots'
require("dotenv").config();

const setupScreenshotsFolder = async () => {
  // Create screenshots if not exists
  if (!fs.existsSync(directory)){
    fs.mkdirSync(directory);
  }

  // Empty Screenshots Folder
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  })
}

const scrapeTradingViewScreenshot = async (req, res, symbol = 'BTCUSDT', interval = '15', chart = '8ZXloR52') => {
  // Empty folder
  await setupScreenshotsFolder();

  // Setup Browser
  const browser = await puppeteer.launch({
    'headless': true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.setCookie(
      {
        'domain': 'www.tradingview.com',
        'name': 'cookiePrivacyPreferenceBannerProduction',
        'value': 'accepted'
      },
      {
        'domain': 'www.tradingview.com',
        'name': 'sessionid',
        'value': 'l7nnuebfvsvp024pnex0oi57shrdw42b'
      },
      {
        'domain': 'www.tradingview.com',
        'name': 'sessionid_sign',
        'value': 'v1:0p/2C5ari832NfHP7QyV/KboCnHnSY3PLLBz07TUlKk='
      }
    );

    await page.goto(
      `https://www.tradingview.com/chart/${chart}?symbol=${symbol}&interval=${interval}`,
      {waitUntil: 'networkidle2'}
    );

    // Setup Page & Screenshot
    await page.addStyleTag({'content': '.tv-floating-toolbar{ display: none; }', 'path': '', 'url': ''});
    await page.setViewport({width: 1280, height: 720, deviceScaleFactor: 2});
    // await page.screenshot({
    //   path: 'screenshot.jpg'
    // })

    // Clipboard Test
    /*
    await page.keyboard.down('Alt'); // Shift+F for fullscreen
    await page.keyboard.press('S');
    await page.evaluate(() => navigator.clipboard.writeText("Injected"));
    const data = await page.evaluate(() => navigator.clipboard.readText());
    console.log(data);
     */

    // Download Screenshot
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './screenshots',
    })
    await new Promise(r => setTimeout(r, 1000));
    await page.keyboard.down('Alt');
    await page.keyboard.down('Meta');
    await page.keyboard.press('S');
    await new Promise(r => setTimeout(r, 1000));

    // Send filenames as JSON array
    // let fileNames= JSON.stringify(fs.readdirSync(directory).map((file) => path.join(directory, file)));
    // res.send(fileNames)

    // Send file
    let file = path.join(directory, fs.readdirSync(directory).find(x=>x!==undefined));
    res.sendfile(file)

  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = {scrapeTradingViewScreenshot};
