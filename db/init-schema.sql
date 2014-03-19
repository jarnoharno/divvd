begin;
create table userdata (
  username text unique not null
    check (length(username) > 1 and length(username) <= 80),
  pass bytea not null, -- 256 bits
  salt bytea not null, -- 64 bits
  user_id serial primary key
);
commit;
