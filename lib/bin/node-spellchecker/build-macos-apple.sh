#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools.

npx node-gyp rebuild --target=22.3.8 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-22.3.8-arm64.node

npx node-gyp rebuild --target=19.0.11 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-19.0.11-arm64.node
