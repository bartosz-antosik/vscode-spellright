#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

node-gyp rebuild --target=4.2.10 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-4.2.10-x64.node

node-gyp rebuild --target=4.2.10 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-4.2.10-ia32.node

node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-6.0.9-x64.node

node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-6.0.9-ia32.node
