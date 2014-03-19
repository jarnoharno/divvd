BUILD := build
BUILD_DOC := $(BUILD)/doc

# documentation targets

app/public/doc/dokumentaatio.pdf: $(BUILD_DOC)/dokumentaatio.pdf | \
	app/public/doc
	cp $(BUILD_DOC)/dokumentaatio.pdf app/public/doc/.

$(BUILD_DOC)/dokumentaatio.pdf: doc/dokumentaatio.tex doc/dokumentaatio.bib | \
	$(BUILD_DOC)
	cd doc; latexmk -pdf -outdir=../$(BUILD_DOC) dokumentaatio.tex

build/doc:
	mkdir -p $(BUILD_DOC)

app/public/doc:
	mkdir app/public/doc

# edit documentation in continuous mode

doc-cont:
	cd doc; latexmk -pdf -outdir=../$(BUILD_DOC) -pvc -view=none \
		-interaction=nonstopmode dokumentaatio.tex

# clean and init heroku database

HEROKU_DB := COBALT
#HEROKU_DB = $(shell heroku pg --app divvd | awk '/DATABASE_URL/ { print $$2 }')

heroku-init-schema:
	heroku pg:reset $(HEROKU_DB) --app divvd --confirm divvd
	heroku pg:psql --app divvd < db/init-schema.sql

heroku-init-data:
	heroku pg:reset COBALT --app divvd --confirm divvd
	heroku pg:psql --app divvd < db/init-schema.sql
	heroku pg:psql --app divvd < db/init-data.sql

# local database targets

# targets that require a running local database
DB_ROOT_TARGETS := create-user create-db grant-all drop-schema
DB_USER_TARGETS := init-schema init-data

BUILD_DB := $(BUILD)/db
BUILD_DB_PREFIX := $(BUILD_DB)/divvd-
DB_TARGETS := $(DB_ROOT_TARGETS) $(DB_USER_TARGETS)
DB_FULL_TARGETS := $(foreach target,$(DB_TARGETS),$(BUILD_DB_PREFIX)$(target))

# aliases for database targets
$(DB_TARGETS): %: $(BUILD_DB_PREFIX)%

ifeq ($(MAKELEVEL),0)
$(DB_FULL_TARGETS): %: $(BUILD_DB)/PG_VERSION
	pg_ctl -w -D $(BUILD_DB) start && $(MAKE) $@; pg_ctl -D $(BUILD_DB) stop
else
$(BUILD_DB_PREFIX)create-user:
	psql postgres postgres -c "create user divvd password 'divvd';"
	touch $@
$(BUILD_DB_PREFIX)create-db: | $(BUILD_DB_PREFIX)create-user
	psql postgres postgres -c "create database divvd encoding 'UTF8';"
	touch $@
$(BUILD_DB_PREFIX)grant-all: | $(BUILD_DB_PREFIX)create-db
	psql postgres postgres -c "grant all on database divvd to divvd;"
	touch $@
$(BUILD_DB_PREFIX)init-schema: | $(BUILD_DB_PREFIX)grant-all
	psql divvd postgres -f db/drop-schema.sql
	psql divvd divvd -f db/init-schema.sql
	touch $@
$(BUILD_DB_PREFIX)init-data: | $(BUILD_DB_PREFIX)grant-all
	psql divvd postgres -f db/drop-schema.sql
	psql divvd divvd -f db/init-schema.sql
	touch $(BUILD_DB_PREFIX)init-schema
	psql divvd divvd -f db/init-data.sql
$(BUILD_DB_PREFIX)drop-schema: | $(BUILD_DB_PREFIX)grant-all
	psql divvd postgres -f db/drop-schema.sql
	rm $(BUILD_DB_PREFIX)init-schema 2> /dev/null; true
endif

create-cluster: $(BUILD_DB)/PG_VERSION
$(BUILD_DB)/PG_VERSION: | $(BUILD_DB)
	initdb -D $(BUILD_DB) --encoding=UTF8 --locale=en_US.UTF8 -U postgres
$(BUILD_DB):
	mkdir -p $(BUILD_DB)

delete-cluster:
	rm -r $(BUILD_DB) 2> /dev/null; true

# start/stop local database
start-db:
	pg_ctl -w -D $(BUILD_DB) start
stop-db:
	pg_ctl -D $(BUILD_DB) stop

# run local app

debug: app/public/doc/dokumentaatio.pdf $(BUILD_DB_PREFIX)init-schema
	pg_ctl start -w -D $(BUILD_DB) && \
		cd app; \
		DATABASE_URL=postgres://divvd:divvd@localhost/divvd node-debug app.js; \
		cd ..; \
		pg_ctl stop -D $(BUILD_DB)

run: app/public/doc/dokumentaatio.pdf $(BUILD_DB_PREFIX)init-schema
	pg_ctl start -w -D $(BUILD_DB) && \
		DATABASE_URL=postgres://divvd:divvd@localhost/divvd node app/app.js; \
		pg_ctl stop -D $(BUILD_DB)

# clean everything

clean:
	rm -r $(BUILD) 2> /dev/null; true
	rm app/public/doc/dokumentaatio.pdf 2> /dev/null; true
