#!/bin/bash

# see comments in ./build-linux-debian.sh

npx node-gyp rebuild --target=16.5.0 --arch=arm64
cp build/Release/spellchecker.node ../spellchecker-darwin-16.5.0-arm64.node

npx node-gyp rebuild --target=14.16.0 --arch=arm64
cp build/Release/spellchecker.node ../spellchecker-darwin-14.16.0-arm64.node

npx node-gyp rebuild --target=12.18.3 --arch=arm64
cp build/Release/spellchecker.node ../spellchecker-darwin-12.18.3-arm64.node

npx node-gyp rebuild --target=10.11.0 --arch=arm64 --build_v8_with_gn=false
cp build/Release/spellchecker.node ../spellchecker-darwin-10.11.0-arm64.node

npx node-gyp rebuild --target=8.9.3 --arch=arm64
cp build/Release/spellchecker.node ../spellchecker-darwin-8.9.3-arm64.node
