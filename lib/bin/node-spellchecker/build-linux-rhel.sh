#!/bin/bash

# see build-linux-debian for comments

npx node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-6.0.9-x64.node

npx node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-6.0.9-ia32.node

npx node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-7.1.7-x64.node

npx node-gyp rebuild --target=7.1.7 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-7.1.7-ia32.node

npx node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-9.1.0-x64.node

npx node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-9.1.0-ia32.node

npx node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-11.1.0-x64.node

npx node-gyp rebuild --target=11.1.0 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-11.1.0-ia32.node

npx node-gyp rebuild --target=12.0.4 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-12.0.4-x64.node

npx node-gyp rebuild --target=12.0.4 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-12.0.4-ia32.node
 
npx node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-13.1.7-x64.node

npx node-gyp rebuild --target=13.1.7 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-rpm-13.1.7-ia32.node
