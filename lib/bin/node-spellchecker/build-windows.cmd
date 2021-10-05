rem see build-linux-debian.sh for comments

call npx node-gyp rebuild --target=13.1.7 --arch=ia32 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-13.1.7-ia32.node

call npx node-gyp rebuild --target=13.1.7 --arch=x64 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-13.1.7-x64.node

call npx node-gyp rebuild --target=12.0.4 --arch=ia32 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-12.0.4-ia32.node

call npx node-gyp rebuild --target=12.0.4 --arch=x64 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-12.0.4-x64.node

call npx node-gyp rebuild --target=11.1.0 --arch=ia32 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-11.1.0-ia32.node

call npx node-gyp rebuild --target=11.1.0 --arch=x64 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-11.1.0-x64.node

call npx node-gyp rebuild --target=9.1.0 --arch=ia32 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-9.1.0-ia32.node

call npx node-gyp rebuild --target=9.1.0 --arch=x64 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-9.1.0-x64.node

call npx node-gyp rebuild --target=7.1.7 --arch=ia32 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-7.1.7-ia32.node

call npx node-gyp rebuild --target=7.1.7 --arch=x64 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
copy build\Release\spellchecker.node ..\spellchecker-win32-7.1.7-x64.node

rem 6.0.9 has issues building
rem call npx node-gyp rebuild --target=6.0.9 --arch=ia32 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
rem copy build\Release\spellchecker.node ..\spellchecker-win32-6.0.9-ia32.node
rem call npx node-gyp rebuild --target=6.0.9 --arch=x64 --python=c:\bin\python27\python.exe --dist-url=https://electronjs.org/headers
rem copy build\Release\spellchecker.node ..\spellchecker-win32-6.0.9-x64.node
