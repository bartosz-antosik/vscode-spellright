#!/bin/bash

# requires node-gyp (installed as a package.json dependency) plus CLI developer tools   
# target versions are _electron_ versions and the headers are pulled from electron's host
# see https://www.electronjs.org/docs/tutorial/using-native-node-modules 
# electron versions used in VSCode (needs to be updated on new VSCode releases)
# 13.1.7
# 12.0.4
# 11.1.0   (first on apple silicon)
# 9.1.0
# 7.1.7
# 6.0.9 

npx node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-13.1.7-x64.node

npx node-gyp rebuild --target=13.1.7 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-13.1.7-ia32.node

npx node-gyp rebuild --target=12.0.4 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-12.0.4-x64.node

npx node-gyp rebuild --target=12.0.4 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-12.0.4-ia32.node

npx node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-11.1.0-x64.node

npx node-gyp rebuild --target=11.1.0 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-11.1.0-ia32.node

npx node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-9.1.0-x64.node

npx node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-9.1.0-ia32.node

npx node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-7.1.7-x64.node

npx node-gyp rebuild --target=7.1.7 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-7.1.7-ia32.node

npx node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-6.0.9-x64.node

npx node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-linux-6.0.9-ia32.node