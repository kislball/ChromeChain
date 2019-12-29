## ChromeChain
ChromeChain is a simple Node.JS REST API to take screenshots of web sites.

Used libraries:
* http
* [puppeteer](https://github.com/puppeteer/puppeteer)
* [node-fetch](https://github.com/bitinn/node-fetch)

If you want to use ChromeChain on Heroku, you should add next buildpacks:
- heroku/node
- https://github.com/heroku/heroku-buildpack-google-chrome.git

If it uses on your server, don't forget to use proxy.

### Usage:
Just send the GET request to ChromeChain with `url` arg, response will be in JSON.


### Examples:

Example URL:
`https://here-is-your-link.com?url=https://google.com`, where `url=https://google.com` means that we want to get snapshot of `https://google.com`. Lol, I think this is understandable :eyes:

```python
# -*- coding: utf-8 -*-

""" Python 3.7 example, uses `requests` """
import requests

target_website = "google.com"

url = f"https://where-is-chromechain-working.lol?url={target_website}"
data = requests.get(url).json()

if data["msg"] == "OK":
  print("Here is snapshot URL:", data["content"])
else:
  print("Error:", data["content"])
```

### Setup:
To setup ChromeChain on your server, just clone the repository, install Node.JS and libraries and then just start it.

Or you can use Heroku:
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Naomi-Bot-Open-Source/ChromeChain)

### License:
MIT License

Copyright (c) 2019 Naomi-Bot-Open-Source
                                                           Permission is hereby granted, free of charge, to any person obtaining a copy                                          of this software and associated documentation files (the "Software"), to deal                                         in the Software without restriction, including without limitation the rights                                          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell                                             copies of the Software, and to permit persons to whom the Software is                                                 furnished to do so, subject to the following conditions:
                                                           The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
                                                           THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR                                            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,                                              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
