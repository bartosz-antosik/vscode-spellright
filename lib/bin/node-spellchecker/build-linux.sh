#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

npx node-gyp rebuild --target=22.4.8 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-22.4.8-x64.node

npx node-gyp rebuild --target=22.4.8 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-22.4.8-ia32.node

npx node-gyp rebuild --target=19.0.11 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-19.0.11-x64.node

npx node-gyp rebuild --target=19.0.11 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-19.0.11-ia32.node
