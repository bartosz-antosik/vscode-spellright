rem Requires node-gyp (npm install -g node-gyp) plus CLI developper tools. Before building run 'npm install'.

call node-gyp rebuild --target=4.2.10 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-4.2.10-ia32.node

call node-gyp rebuild --target=4.2.10 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-4.2.10-x64.node

call node-gyp rebuild --target=6.0.9 --arch=ia32 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-6.0.9-ia32.node

call node-gyp rebuild --target=6.0.9 --arch=x64 --dist-url=https://atom.io/download/electron --python=c:\bin\python27\python.exe
copy build\Release\spellchecker.node ..\spellchecker-win32-6.0.9-x64.node
