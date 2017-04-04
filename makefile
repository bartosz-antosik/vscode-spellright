
.SILENT:

.PHONY:

all:

initialize:

finalize:

clean:

vsce-pack:
	vsce package package.json
	mv *.vsix .output/

vsce-publish:
	vsce publish package.json

package: initialize clean vsce-pack finalize

publish: initialize clean vsce-publish finalize