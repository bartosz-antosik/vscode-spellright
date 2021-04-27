#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-intel-9.1.0-x64.node

node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-intel-11.1.0-x64.node

node-gyp rebuild --target=12.0.5 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-intel-12.0.5-x64.node
