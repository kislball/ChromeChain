#!/bin/python3
# -*- coding: utf-8 -*-

"""
Python 3 example, uses `requests` and `Pillow`
"""

import requests
from io import BytesIO
from PIL import Image

target_website = "google.com"
url = f"http://localhost:5000?url={target_website}"

response = requests.get(url)

if response.status_code == 200:
  im = Image.open(BytesIO(response.content))
  im.show()

else:
  print("Error:", response.json()["content"])
