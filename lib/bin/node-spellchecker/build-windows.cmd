rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools.

call npx node-gyp rebuild --target=29.4.0 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-29.4.0-x64.node

@REM call npx node-gyp rebuild --target=29.4.0 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
@REM copy build\Release\spellchecker.node ..\spellchecker-win32-29.4.0-ia32.node

call npx node-gyp rebuild --target=28.2.10 --arch=x64 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-28.2.10-x64.node

@REM call npx node-gyp rebuild --target=28.2.10 --arch=ia32 --dist-url=https://electronjs.org/headers --python=c:\bin\python27\python.exe
@REM copy build\Release\spellchecker.node ..\spellchecker-win32-28.2.10-ia32.node
