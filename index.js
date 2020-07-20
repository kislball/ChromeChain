/*
MIT License

Copyright (c) 2019 Naomi-Bot-Open-Source

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
const fetch = require('node-fetch');
const http = require('http');
const url = require('url');


class ChromeChain {
  constructor() {
    this.start();
  }

  async start() {
    let args = ['--no-sandbox', '--disable-setuid-sandbox'];
    if (process.env.PROXY) args.add(`--proxy-server=${process.env.PROXY}`);
    this.browser = await puppeteer.launch({
      args: args,
      defaultViewport: {
        width: 1366,
        height: 768
      }
    });
  }

  async takeScreenshot(url) {
    url = url.startsWith("http") ? url : `http://${url}`;
    let page = await this.browser.newPage();
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    let shot = await page.screenshot();
    await page.close();
    return shot;
  }
}


async function main() {
  const Puppet = new ChromeChain();

  http.createServer((req, res) => {
    var args = url.parse(req.url, true).query || null;

    if (!args.url) {
      
      let msg = {"msg": "ERR", "content": "Provide a target URL, please"};
      res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
      res.write(JSON.stringify(msg));
      res.end(null);
      
    } else {
      
      Puppet.takeScreenshot(args.url).then(data  => {
        
        fetch("https://api.imgur.com/3/image", {
          "headers": {
            "Authorization": "Client-ID 6656d64547a5031",
            "Content-Type": "application/json"
          },
          "method": "POST",
          "body": data
        })
        .then(resp => resp.json())
        .then(json => {
          
          let msg = {"msg": "OK", "content": json.data.link};
          res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
          res.write(JSON.stringify(msg));
          res.end(null);
          
        });
      }).catch(err => {
        
        let msg = {"msg": "ERR", "content": `${err}`};
        res.writeHead(500, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
        res.write(JSON.stringify(msg));
        res.end(null);
        
      });
    }
  }).listen(process.env.PORT);
}

main();
console.log(`[OK] Listening on the port ${process.env.PORT}`);
