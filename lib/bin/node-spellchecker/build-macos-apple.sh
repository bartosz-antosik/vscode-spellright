#!/bin/bash

# see comments in ./build-linux-debian.sh

npx node-gyp rebuild --target=13.1.7 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-13.1.7-arm64.node

npx node-gyp rebuild --target=12.0.4 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-12.0.4-arm64.node

npx node-gyp rebuild --target=11.1.0 --arch=arm64 --dist-url=https://electronjs.org/headers
cp build/Release/spellchecker.node ../spellchecker-darwin-11.1.0-arm64.node


