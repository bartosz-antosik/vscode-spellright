rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools. Before building run 'npm install'.

call npx node-gyp rebuild --target=18.3.5 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-18.3.5-x64.node

call npx node-gyp rebuild --target=18.3.5 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-18.3.5-ia32.node

call npx node-gyp rebuild --target=17.2.0 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-17.2.0-x64.node

call npx node-gyp rebuild --target=17.2.0 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-17.2.0-ia32.node
