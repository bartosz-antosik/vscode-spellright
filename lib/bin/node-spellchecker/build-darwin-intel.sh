#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

npx node-gyp rebuild --target=42.4.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-42.4.0-x64.node

npx node-gyp rebuild --target=39.2.3 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-39.2.3-x64.node
