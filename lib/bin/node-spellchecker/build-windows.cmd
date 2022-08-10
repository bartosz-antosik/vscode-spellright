rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

call npx node-gyp rebuild --target=19.0.11 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-19.0.11-x64.node

call npx node-gyp rebuild --target=19.0.11 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-19.0.11-ia32.node

call npx node-gyp rebuild --target=18.3.5 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-18.3.5-x64.node

call npx node-gyp rebuild --target=18.3.5 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-18.3.5-ia32.node
