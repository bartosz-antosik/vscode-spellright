#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools

node-gyp rebuild --target=9.1.0 --arch=arm64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-apple-9.1.0-arm64.node

node-gyp rebuild --target=11.1.0 --arch=arm64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-apple-11.1.0-arm64.node

node-gyp rebuild --target=12.0.5 --arch=arm64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-apple-12.0.5-arm64.node
