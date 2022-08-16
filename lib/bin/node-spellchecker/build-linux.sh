#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

npx node-gyp rebuild --target=19.0.11 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-linux-19.0.11-x64.node

npx node-gyp rebuild --target=19.0.11 --arch=ia32
cp build/Release/spellchecker.node ../spellchecker-linux-19.0.11-ia32.node

npx node-gyp rebuild --target=18.3.5 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-linux-18.3.5-x64.node

npx node-gyp rebuild --target=18.3.5 --arch=ia32
cp build/Release/spellchecker.node ../spellchecker-linux-18.3.5-ia32.node
