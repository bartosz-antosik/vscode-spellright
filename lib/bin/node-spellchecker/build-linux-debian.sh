#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

node-gyp rebuild --target=17.2.0 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-deb-17.2.0-ia32.node

node-gyp rebuild --target=17.2.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-deb-17.2.0-x64.node

node-gyp rebuild --target=18.3.5 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-deb-18.3.5-ia32.node

node-gyp rebuild --target=18.3.5 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-deb-18.3.5-x64.node
