#!/bin/bash

# requires node-gyp (installed as a package.json dependency) plus CLI developer tools

npx node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-6.0.9-ia32.node

npx node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-6.0.9-x64.node

npx node-gyp rebuild --target=7.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-7.1.7-ia32.node

npx node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-7.1.7-x64.node

npx node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-9.1.0-ia32.node

npx node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-9.1.0-x64.node

npx node-gyp rebuild --target=11.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-11.1.0-ia32.node

npx node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-11.1.0-x64.node

npx node-gyp rebuild --target=12.0.4 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-12.0.4-ia32.node

npx node-gyp rebuild --target=12.0.4 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-12.0.4-x64.node

npx node-gyp rebuild --target=13.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-13.1.7-ia32.node

npx node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
cp build/Release/spellchecker.node ../spellchecker-deb-13.1.7-x64.node
