#!/bin/bash
# see build-linux-debian.sh for comments

npx node-gyp rebuild --target=16.5.0 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-darwin-16.5.0-x64.node

npx node-gyp rebuild --target=14.16.0 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-darwin-14.16.0-x64.node

npx node-gyp rebuild --target=12.18.3 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-darwin-12.18.3-x64.node

npx node-gyp rebuild --target=10.11.0 --arch=x64 --build_v8_with_gn=false
cp build/Release/spellchecker.node ../spellchecker-darwin-10.11.0-x64.node

npx node-gyp rebuild --target=8.9.3 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-darwin-8.9.3-x64.node
