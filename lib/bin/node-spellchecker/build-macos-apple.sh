#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools

npx node-gyp rebuild --target=18.3.5 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-18.3.5-arm64.node

npx node-gyp rebuild --target=17.2.0 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-17.2.0-arm64.node
