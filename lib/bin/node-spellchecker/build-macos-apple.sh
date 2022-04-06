#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools

node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-13.1.7-arm64.node

node-gyp rebuild --target=17.2.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-17.2.0-arm64.node
