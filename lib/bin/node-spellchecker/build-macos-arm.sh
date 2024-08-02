#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools.

npx node-gyp rebuild --target=30.1.2 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-30.1.2-arm64.node

npx node-gyp rebuild --target=29.4.0 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-29.4.0-arm64.node
