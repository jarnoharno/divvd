PORT := 3000
SSL_PORT := 4000
HEROKU_APP := divvd
HEROKU_DB := COBALT
#HEROKU_DB = $(shell heroku pg --app divvd | awk '/DATABASE_URL/ { print $$2 }')
LOCALHOST := localhost
LOCALURL := https://$(LOCALHOST):$(SSL_PORT)

BUILD := build
BUILD_CERT := $(BUILD)/cert
KEY_PEM := $(BUILD_CERT)/key.pem
CERT_PEM := $(BUILD_CERT)/cert.pem
BUILD_DOC := $(BUILD)/doc
LOCAL_DB_URL := postgres://divvd:divvd@localhost/divvd
BUILD_DB := $(BUILD)/db
BUILD_DB_PREFIX := $(BUILD_DB)/divvd-

# documentation targets

doc: app/public/nonsecure/doc/dokumentaatio.pdf
app/public/nonsecure/doc/dokumentaatio.pdf: $(BUILD_DOC)/dokumentaatio.pdf | \
	app/public/nonsecure/doc
	cp $(BUILD_DOC)/dokumentaatio.pdf app/public/nonsecure/doc/.

$(BUILD_DOC)/dokumentaatio.pdf: doc/dokumentaatio.tex doc/dokumentaatio.bib | \
	$(BUILD_DOC)
	cd doc; latexmk -pdf -outdir=../$(BUILD_DOC) dokumentaatio.tex

build/doc:
	mkdir -p $(BUILD_DOC)

app/public/nonsecure/doc:
	mkdir app/public/nonsecure/doc

# edit documentation in continuous mode

doc-cont:
	cd doc; latexmk -pdf -outdir=../$(BUILD_DOC) -pvc -view=none \
		-interaction=nonstopmode dokumentaatio.tex

# clean and init heroku database

heroku-init-schema:
	heroku pg:reset $(HEROKU_DB) --app divvd --confirm divvd
	heroku pg:psql --app divvd < db/init-schema.sql
	heroku pg:psql --app divvd < db/init-helpers.sql

heroku-init-data:
	heroku pg:reset COBALT --app divvd --confirm divvd
	heroku pg:psql --app divvd < db/init-schema.sql
	heroku pg:psql --app divvd < db/init-helpers.sql
	heroku pg:psql --app divvd < db/init-data.sql

# local database targets



# targets that require a running local database
DB_ROOT_TARGETS := create-user create-db grant-all drop-schema reset-db
DB_USER_TARGETS := init-schema init-data

DB_TARGETS := $(DB_ROOT_TARGETS) $(DB_USER_TARGETS)
DB_FULL_TARGETS := $(foreach target,$(DB_TARGETS),$(BUILD_DB_PREFIX)$(target))

# aliases for database targets
$(DB_TARGETS): %: $(BUILD_DB_PREFIX)%

ifeq ($(MAKELEVEL),0)
$(DB_FULL_TARGETS): %: $(BUILD_DB)/PG_VERSION
	pg_ctl -w -D $(BUILD_DB) start && $(MAKE) $@; pg_ctl -D $(BUILD_DB) stop
$(BUILD_DB_PREFIX)create-db: | $(BUILD_DB_PREFIX)create-user
$(BUILD_DB_PREFIX)grant-all: | $(BUILD_DB_PREFIX)create-db
$(BUILD_DB_PREFIX)init-schema: db/drop-schema.sql db/init-schema.sql | \
	$(BUILD_DB_PREFIX)grant-all
$(BUILD_DB_PREFIX)init-data: | $(BUILD_DB_PREFIX)grant-all
$(BUILD_DB_PREFIX)drop-schema: | $(BUILD_DB_PREFIX)grant-all
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
$(BUILD_DB_PREFIX)init-schema: db/drop-schema.sql db/init-schema.sql | \
	$(BUILD_DB_PREFIX)grant-all
	psql divvd postgres -f db/drop-schema.sql
	psql divvd divvd -f db/init-schema.sql
	psql divvd divvd -f db/init-helpers.sql
	touch $@
# alternative database targets
$(BUILD_DB_PREFIX)init-data: | $(BUILD_DB_PREFIX)grant-all
	psql divvd postgres -f db/drop-schema.sql
	psql divvd divvd -f db/init-schema.sql
	psql divvd divvd -f db/init-helpers.sql
	touch $(BUILD_DB_PREFIX)init-schema
	psql divvd divvd -f db/init-data.sql
$(BUILD_DB_PREFIX)drop-schema: | $(BUILD_DB_PREFIX)grant-all
	psql divvd postgres -f db/drop-schema.sql
	rm $(BUILD_DB_PREFIX)init-schema 2> /dev/null; true
$(BUILD_DB_PREFIX)reset-db: $(BUILD_DB_PREFIX)drop-schema \
	$(BUILD_DB_PREFIX)init-data
endif

create-cluster: $(BUILD_DB)/PG_VERSION
$(BUILD_DB)/PG_VERSION: | $(BUILD_DB)
	initdb -D $(BUILD_DB) --encoding=UTF8 --locale=en_US.UTF8 -U postgres
	sed -i "s/#log_statement = [^#]*/log_statement =     'all' /g" \
		$(BUILD_DB)/postgresql.conf
$(BUILD_DB):
	mkdir -p $(BUILD_DB)

delete-cluster:
	rm -r $(BUILD_DB) 2> /dev/null; true

# start/stop local database
start-db:
	pg_ctl -w -D $(BUILD_DB) start
stop-db:
	pg_ctl -D $(BUILD_DB) stop

# for debugging db
debug-db:
	if pg_ctl -w -D $(BUILD_DB) start > /dev/null; then \
		psql divvd divvd; \
		pg_ctl -D $(BUILD_DB) stop; \
	fi;

# create local certificate

PEM := $(KEY_PEM) $(CERT_PEM)

$(BUILD_CERT):
	mkdir -p $(BUILD_CERT)

pem: $(PEM)
$(PEM): | $(BUILD_CERT)
	openssl req -newkey rsa:2048 -new -nodes -x509 \
		-keyout $(KEY_PEM) -out $(CERT_PEM) \
		-subj '/CN=$(LOCALHOST)/O=Divvd LTD./C=FI'

# run local app

define start-local
	if pg_ctl start -w -D $(BUILD_DB) $1; then \
		export DATABASE_URL=$(LOCAL_DB_URL); \
		export PORT=$(PORT); \
		export SSL_PORT=$(SSL_PORT); \
		(node local/proxy.js $(KEY_PEM) $(CERT_PEM) $1 &) ; \
		$2 \
		pkill node; \
		pg_ctl stop -D $(BUILD_DB); \
	fi;
endef

debug: $(BUILD_DB_PREFIX)init-schema $(PEM)
	$(call start-local,,\
		(cd app && node-debug app.js);\
	)

run: $(BUILD_DB_PREFIX)init-schema $(PEM)
	$(call start-local,,\
		node app/app.js;\
	)

# test

.PHONY: test
test: $(BUILD_DB_PREFIX)init-schema $(PEM)
	$(call start-local,> /dev/null,\
		(node app/app.js > /dev/null &);\
		while ! curl -k -s $(LOCALURL)/api/account > /dev/null; do sleep 0.5; done;\
		mocha;\
	)

# clean everything

clean:
	rm -r $(BUILD) 2> /dev/null; true
	rm app/public/nonsecure/doc/dokumentaatio.pdf 2> /dev/null; true
