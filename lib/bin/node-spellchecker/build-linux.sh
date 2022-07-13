#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

npx node-gyp rebuild --target=18.3.5 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-18.3.5-x64.node

npx node-gyp rebuild --target=18.3.5 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-18.3.5-ia32.node

npx node-gyp rebuild --target=17.9.1 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-17.9.1-x64.node

npx node-gyp rebuild --target=17.9.1 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-17.9.1-ia32.node
