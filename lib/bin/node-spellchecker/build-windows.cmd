rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools. Before building run 'npm install'.

call node-gyp rebuild --target=13.1.7 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-13.1.7-ia32.node

call node-gyp rebuild --target=13.1.7 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-13.1.7-x64.node

call node-gyp rebuild --target=17.2.0 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-17.2.0-ia32.node

call node-gyp rebuild --target=17.2.0 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-17.2.0-x64.node

