app/public/doc/dokumentaatio.pdf: doc/dokumentaatio.tex doc/dokumentaatio.bib
	cd doc; latexmk -pdf -outdir=../build dokumentaatio.tex && \
		cp ../build/dokumentaatio.pdf ../app/public/doc/.

clean:
	rm -r build 2> /dev/null; true
	rm app/public/doc/dokumentaatio.pdf 2> /dev/null; true

.PHONY: clean
