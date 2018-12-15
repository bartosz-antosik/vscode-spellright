#!/bin/bash

# requires node-gyp (npm install -g node-gyp) plus CLI developper tools

# node-gyp rebuild --target=1.7.7 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-rpm-1.7.7-x64.node

# node-gyp rebuild --target=1.7.7 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-rpm-1.7.7-ia32.node

# node-gyp rebuild --target=1.8.4 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-rpm-1.8.4-x64.node

# node-gyp rebuild --target=1.8.4 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-rpm-1.8.4-ia32.node

node-gyp rebuild --target=2.0.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-2.0.7-x64.node

node-gyp rebuild --target=2.0.7 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-2.0.7-ia32.node

node-gyp rebuild --target=3.0.10 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-3.0.10-x64.node

node-gyp rebuild --target=3.0.10 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-rpm-3.0.10-ia32.node
