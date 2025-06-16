#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools.

npx node-gyp rebuild --target=35.5.1 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-35.5.1-arm64.node

npx node-gyp rebuild --target=34.2.0 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-34.2.0-arm64.node
