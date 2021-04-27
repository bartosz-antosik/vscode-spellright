rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools. Before building run 'npm install'.

call node-gyp rebuild --target=9.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-9.1.0-ia32.node

call node-gyp rebuild --target=9.1.0 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-9.1.0-x64.node

call node-gyp rebuild --target=11.1.0 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-11.1.0-ia32.node

call node-gyp rebuild --target=11.1.0 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-11.1.0-x64.node

call node-gyp rebuild --target=12.0.5 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-12.0.5-ia32.node

call node-gyp rebuild --target=12.0.5 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-12.0.5-x64.node
