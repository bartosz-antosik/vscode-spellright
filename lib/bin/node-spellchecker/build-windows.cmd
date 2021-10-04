rem requires node-gyp (installed as a package.json dependency) plus CLI developer tools
rem Before building run 'npm install' to have the package.json dependencies available

rem call node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-6.0.9-ia32.node

rem call node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-6.0.9-x64.node

rem call node-gyp rebuild --target=7.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-7.1.7-ia32.node

rem call node-gyp rebuild --target=7.1.7 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-7.1.7-x64.node

rem call node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-9.1.0-ia32.node

rem call node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-9.1.0-x64.node

rem call node-gyp rebuild --target=11.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-11.1.0-ia32.node

rem call node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
rem copy build\Release\spellchecker.node ..\spellchecker-win32-11.1.0-x64.node

call npx node-gyp rebuild --target=12.0.4 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-12.0.4-ia32.node

call npx node-gyp rebuild --target=12.0.4 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-12.0.4-x64.node

call npx node-gyp rebuild --target=13.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-13.1.7-ia32.node

call npx node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-13.1.7-x64.node

