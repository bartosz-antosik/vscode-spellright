rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

call npx node-gyp rebuild --target=35.5.1 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-35.5.1-x64.node

@REM call npx node-gyp rebuild --target=35.5.1 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
@REM copy build\Release\spellchecker.node ..\spellchecker-win32-35.5.1-ia32.node

call npx node-gyp rebuild --target=34.2.0 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-34.2.0-x64.node

@REM call npx node-gyp rebuild --target=34.2.0 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
@REM copy build\Release\spellchecker.node ..\spellchecker-win32-34.2.0-ia32.node
