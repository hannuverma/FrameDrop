const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.static(__dirname));

const server = app.listen(3000, async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/room.html', { waitUntil: 'networkidle0' });
    const content = await page.content();
    console.log(content.substring(0, 1500));
    
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER ERROR', err);
  } finally {
    server.close();
  }
});