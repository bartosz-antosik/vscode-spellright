#!/bin/bash

# requires node-gyp (installed as a package.json dependency) plus CLI developer tools

npx node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-6.0.9-x64.node

npx node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-7.1.7-x64.node

npx node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-9.1.0-x64.node

npx node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-11.1.0-x64.node

npx node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-darwin-13.1.7-x64.node
