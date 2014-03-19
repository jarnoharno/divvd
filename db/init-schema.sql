begin;
create table userdata (
  username text,
  pass bytea, -- 256 bits
  salt bytea, -- 64 bits
  user_id serial primary key
);
commit;
