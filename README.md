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
