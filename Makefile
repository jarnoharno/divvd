app/public/doc/dokumentaatio.pdf: build/dokumentaatio.pdf app/public/doc
	cp build/dokumentaatio.pdf app/public/doc/.

build/dokumentaatio.pdf: doc/dokumentaatio.tex doc/dokumentaatio.bib build
	cd doc; latexmk -pdf -outdir=../build dokumentaatio.tex

build:
	mkdir build

app/public/doc:
	mkdir app/public/doc

clean:
	rm -r build 2> /dev/null; true
	rm app/public/doc/dokumentaatio.pdf 2> /dev/null; true

.PHONY: clean

doc-cont:
	cd doc; latexmk -pdf -outdir=../build -pvc -view=none \
		-interaction=nonstopmode dokumentaatio.tex

.PHONY: doc-cont
