#!/bin/bash

# requires node-gyp (installed as a package.json dependency) plus CLI developer tools   
# target versions are nodejs versions, not electron versions. 
# The versions used in the past need to be grabbed from VSCode release notes and / or the git history at
# https://github.com/microsoft/vscode/blob/main/cgmanifest.json#L55 
# and / or https://github.com/microsoft/vscode/blob/main/remote/.yarnrc 
# 14.16.0
# 12.18.3
# 12.14.1
# 12.13.0 
# 12.8.1
# 12.4.0
# 10.11.0
# 10.2.1
# 10.2.0
# 8.9.3
# // TO be researched: why were the versions that were originally in this file looking like electron versions and not node versions? 
# //    and why were the headers pulled from the atom electron URLs and not the original node URLs? 

npx node-gyp rebuild --target=14.16.0 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-deb-14.16.0-x64.node

npx node-gyp rebuild --target=14.16.0 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-deb-13.1.7-arm64.node

npx node-gyp rebuild --target=12.18.3 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-deb-12.18.3-arm64.node

npx node-gyp rebuild --target=10.11.0 --arch=x64 --build_v8_with_gn=false
cp build/Release/spellchecker.node ../spellchecker-deb-10.11.0-arm64.node

npx node-gyp rebuild --target=8.9.3 --arch=x64
cp build/Release/spellchecker.node ../spellchecker-deb-8.9.3-arm64.node

# npx node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-6.0.9-ia32.node

# npx node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-6.0.9-x64.node

# npx node-gyp rebuild --target=7.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-7.1.7-ia32.node

# npx node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-7.1.7-x64.node

# npx node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-9.1.0-ia32.node

# npx node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-9.1.0-x64.node

# npx node-gyp rebuild --target=11.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-11.1.0-ia32.node

# npx node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-11.1.0-x64.node

# npx node-gyp rebuild --target=12.0.4 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-12.0.4-ia32.node

# npx node-gyp rebuild --target=12.0.4 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-12.0.4-x64.node

# npx node-gyp rebuild --target=13.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-13.1.7-ia32.node

# npx node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron
# cp build/Release/spellchecker.node ../spellchecker-deb-13.1.7-x64.node
