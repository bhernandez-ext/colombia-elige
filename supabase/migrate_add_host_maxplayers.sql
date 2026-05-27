-- Run this in Supabase SQL Editor if your games table is missing these columns
alter table games add column if not exists max_players int not null default 4;
alter table games add column if not exists host_token text;
