const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const { scrapeTradingViewScreenshot } = require("./scrapeTradingViewScreenshot");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
  scrapeTradingViewScreenshot(req, res, req.query.symbol ?? 'BTCUSDT', req.query.interval ?? '15', req.query.chart ?? '8ZXloR52');
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
