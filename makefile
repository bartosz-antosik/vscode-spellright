
.SILENT:

.PHONY:

all:

initialize:

finalize:

clean:

vsce-pack:
	vsce package
	mv *.vsix .output/

vsce-publish:
	vsce publish patch

package: initialize clean vsce-pack finalize

publish: initialize clean vsce-publish finalize