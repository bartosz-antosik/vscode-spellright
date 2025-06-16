#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

npx node-gyp rebuild --target=35.5.1 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-35.5.1-x64.node

npx node-gyp rebuild --target=34.2.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-macos-34.2.0-x64.node
