#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developer tools

node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-9.1.0-m1.node

node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-11.1.0-m1.node

node-gyp rebuild --target=12.0.4 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-12.0.4-m1.node

node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-13.1.7-m1.node
