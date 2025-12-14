#!/data/data/com.termux/files/usr/bin/bash

URL="http://localhost:8000"

am start \
  -a android.intent.action.VIEW \
  -d "$URL" \
  -n org.mozilla.firefox/org.mozilla.gecko.BrowserApp
