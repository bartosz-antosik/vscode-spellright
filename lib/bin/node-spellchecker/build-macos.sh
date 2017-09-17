#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

node-gyp rebuild --target=1.7.3 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-1.7.3-x64.node

node-gyp rebuild --target=1.7.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-1.7.7-x64.node



