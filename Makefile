app/public/doc/dokumentaatio.pdf: doc/dokumentaatio.tex
	latexmk -pdf -outdir=build doc/dokumentaatio && \
		cp build/dokumentaatio.pdf app/public/doc/.

clean:
	rm -r build
	rm app/public/doc/dokumentaatio.pdf

.PHONY: clean
