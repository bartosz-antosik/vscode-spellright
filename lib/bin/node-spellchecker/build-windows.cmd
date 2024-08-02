rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

call npx node-gyp rebuild --target=30.1.2 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-30.1.2-x64.node

@REM call npx node-gyp rebuild --target=30.1.2 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
@REM copy build\Release\spellchecker.node ..\spellchecker-win32-30.1.2-ia32.node

call npx node-gyp rebuild --target=29.4.0 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-29.4.0-x64.node

@REM call npx node-gyp rebuild --target=29.4.0 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
@REM copy build\Release\spellchecker.node ..\spellchecker-win32-29.4.0-ia32.node
