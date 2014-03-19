begin;
drop schema public cascade;
create schema public;
grant all on schema public to postgres;
grant all on schema public to public;
comment on schema public is 'standard public schema';
commit;
