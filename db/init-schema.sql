begin;
create table userdata (
  username text,
  pass bytea, -- 256 bytes
  salt bytea, -- 64 bytes
  user_id serial primary key
);
commit;
