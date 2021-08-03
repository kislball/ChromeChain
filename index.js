/*
MIT License

Copyright (c) 2019 The-Naomi-Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const puppeteer = require('puppeteer');
const http = require('http');
const url = require('url');

const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const COOLDOWN = process.env.COOLDOWN || 2000;
const CACHE_DIR = 'cache';
const WAIT_BEFORE_SS = process.env.WAIT_BEFORE_SCREENSHOT || 2000;
const PROXY_SERVER = process.env.PROXY;

var busy = [];


// Check if cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  console.log('Creating a cache directory since it does not exist')
  fs.mkdirSync(CACHE_DIR);

} else {
  // Remove all cached screenshots on startup
  // if cache directory if exists
  fs.readdir(CACHE_DIR, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }

    for (const file of files) {
      fs.unlink(path.join(CACHE_DIR, file), err => {
        if (err) throw err;
      });
    }
  });
}


class ChromeChain {
  constructor() {
    this.start();
  }

  async start() {
    let args = ['--no-sandbox', '--disable-setuid-sandbox'];
    if (process.env.PROXY) args.push(`--proxy-server=${PROXY_SERVER}`);

    this.browser = await puppeteer.launch({
      args: args,
      defaultViewport: {
        width: Number(process.env.SCREENSHOT_WIDTH) || 1366,
        height: Number(process.env.SCREENSHOT_HEIGHT) || 768
      }
    });
  }

  async takeScreenshot(url_) {
    var page = await this.browser.newPage();
    await page.goto(url_, {waitUntil: 'load'});

    let get_binary = () => new Promise(function (res, rej) {
      setTimeout(async () => {
        page.screenshot().then(binary => {
          res(binary);
        }).catch(err => {
          rej(err);
        });
      }, WAIT_BEFORE_SS);
    });

    let binary = await get_binary();
    await page.close();

    return binary;
  }
}


async function main() {
  const Puppet = new ChromeChain();

  http.createServer((req, res) => {

    var args = url.parse(req.url, true).query || null;
    if (!args.url) return;

    args.url = args.url.startsWith("http") ? args.url : `http://${args.url}`;
    var base_url = args.url.replace('http://', '').replace('https://', '');

    console.log(`[INFO] ${req.connection.remoteAddress} requested screenshot of '${args.url}'`)

    if (!Puppet.browser) {

      let msg = {"msg": "ERR", "content": "Chromium is starting. Please, wait until it is up."};
      res.writeHead(403, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
      res.write(JSON.stringify(msg));
      res.end(null);
      return;

    } else if (!args.url) {

      let msg = {"msg": "ERR", "content": "Provide a target URL, please"};
      res.writeHead(404, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
      res.write(JSON.stringify(msg));
      res.end(null);

    } else {

      if (busy.includes(req.connection.remoteAddress)) {

        let msg = {"msg": "ERR", "content": "You are being ratelimited. Please, be patient."};
        res.writeHead(429, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
        res.write(JSON.stringify(msg));
        res.end(null);
        return;

      } else {
        busy.push(req.connection.remoteAddress);
      }

      var CURRENT_SS_PATH = `${CACHE_DIR}/${base_url.replace(/\//g, '__')}.png`;

      // Check if current website is in cache
      if (fs.existsSync(CURRENT_SS_PATH)) {
        console.log(`Screenshot of ${base_url} exists in cache.`)

        // Send image from cache instead of taking a new screenshot
        // to avoid ban from website
        bytes = fs.readFileSync(CURRENT_SS_PATH);

        res.writeHead(200, {"Content-Type": "image/png", "Access-Control-Allow-Origin": "*"})
        res.write(bytes)
        res.end(null);

        setTimeout(() => busy.splice(busy.indexOf(req.connection.remoteAddress), 1), COOLDOWN);

        return;
      }

      Puppet.takeScreenshot(args.url).then(bytes => {
        console.log(`Screenshot of ${base_url} does not exist in cache.`)

        // write screenshot into cache file to avoid multiple requests
        // to the given resource
        fs.writeFileSync(CURRENT_SS_PATH, bytes);

        res.writeHead(200, {"Content-Type": "image/png", "Access-Control-Allow-Origin": "*"})
        res.write(bytes)
        res.end(null);

        setTimeout(() => busy.splice(busy.indexOf(req.connection.remoteAddress), 1), COOLDOWN);

      }).catch(err => {
        
        let msg = {"msg": "ERR", "content": `${err}`};
        res.writeHead(500, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
        res.write(JSON.stringify(msg));
        res.end(null);
        setTimeout(() => busy.splice(busy.indexOf(req.connection.remoteAddress), 1), COOLDOWN);

        
      });
    }
  }).listen(PORT);
}

main();
console.log(`[OK] Listening on port ${PORT}`);
