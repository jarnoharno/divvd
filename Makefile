# documentation targets

app/public/doc/dokumentaatio.pdf: build/doc/dokumentaatio.pdf | app/public/doc
	cp build/doc/dokumentaatio.pdf app/public/doc/.

build/doc/dokumentaatio.pdf: doc/dokumentaatio.tex doc/dokumentaatio.bib \
	build/doc
	cd doc; latexmk -pdf -outdir=../build/doc dokumentaatio.tex

build/doc:
	mkdir -p build/doc

app/public/doc:
	mkdir app/public/doc

# edit documentation in continuous mode

.PHONY: doc-cont
doc-cont:
	cd doc; latexmk -pdf -outdir=../build -pvc -view=none \
		-interaction=nonstopmode dokumentaatio.tex

# local database targets

GREPE = grep -e 'ERROR' -e 'FATAL'
PG = postgres --single -D build/db postgres 2>&1 | $(GREPE)
PGD = postgres --single -j -D build/db divvd

.PHONY: init-db
init-db: | build/db/divvd-init-data
build/db/divvd-create-user: | build/db/PG_VERSION
	! echo "create user divvd password 'divvd'" | $(PG)
	touch build/db/divvd-create-user
build/db/divvd-create-db: | build/db/divvd-create-user
	! echo "create database divvd owner divvd encoding 'UTF8'" | $(PG)
	touch build/db/divvd-create-db
build/db/divvd-init: | build/db/divvd-create-db
	! $(PGD) < db/init.sql 2>&1 | $(GREPE)
	touch build/db/divvd-init
build/db/divvd-init-data: | build/db/divvd-init
	! $(PGD) < db/init-data.sql 2>&1 | $(GREPE)
	touch build/db/divvd-init-data

.PHONY: create-db
create-db: build/db/PG_VERSION
build/db/PG_VERSION: | build/db
	initdb -D build/db --encoding=UTF8 --locale=en_US.UTF8

build/db:
	mkdir -p build/db

.PHONY: clean-db
clean-db:
	rm -r build/db 2> /dev/null; true

# run local database

.PHONY: start-db
start-db: create-db
	postgres -D build/db

# run local app

.PHONY: run
run: app/public/doc/dokumentaatio.pdf build/db/divvd-init-data
	scripts/run.sh

# clean everything

.PHONY: clean
clean:
	rm -r build 2> /dev/null; true
	rm app/public/doc/dokumentaatio.pdf 2> /dev/null; true

