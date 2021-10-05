rem see build-linux-debian.sh for comments

call npx node-gyp rebuild --target=16.5.0 --arch=ia32 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-16.5.0-ia32.node

call npx node-gyp rebuild --target=16.5.0 --arch=x64 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-16.5.0-x64.node

call npx node-gyp rebuild --target=14.16.0 --arch=ia32 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-14.16.0-ia32.node

call npx node-gyp rebuild --target=14.16.0 --arch=x64 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-14.16.0-x64.node

call npx node-gyp rebuild --target=12.18.3 --arch=ia32 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-12.18.3-ia32.node

call npx node-gyp rebuild --target=12.18.3 --arch=x64 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-12.18.3-x64.node

call npx node-gyp rebuild --target=10.11.0 --arch=ia32 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-10.11.0-ia32.node

call npx node-gyp rebuild --target=10.11.0 --arch=x64 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-10.11.0-x64.node

call npx node-gyp rebuild --target=8.9.3 --arch=ia32 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-8.9.3-ia32.node

call npx node-gyp rebuild --target=8.9.3 --arch=x64 --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-8.9.3-x64.node

