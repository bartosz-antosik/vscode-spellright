#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-6.0.9-x64.node

node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-6.0.9-ia32.node

node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-7.1.7-x64.node

node-gyp rebuild --target=7.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-7.1.7-ia32.node

node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-9.1.0-x64.node

node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-9.1.0-ia32.node
