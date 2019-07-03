#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

# node-gyp rebuild --target=1.7.7 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-darwin-1.7.7-x64.node

# node-gyp rebuild --target=1.8.4 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-darwin-1.8.4-x64.node

# node-gyp rebuild --target=2.0.7 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-darwin-2.0.7-x64.node

node-gyp rebuild --target=3.0.10 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-3.0.10-x64.node

node-gyp rebuild --target=4.2.5 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-4.2.5-x64.node
