pg_ctl start -D build/db
node app/app.js
pg_ctl stop -D build/db
