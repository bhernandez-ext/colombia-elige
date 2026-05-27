create table games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  phase text default 'r1',
  turn int default 1,
  max_turns int default 10,
  max_players int not null default 4,
  status text default 'waiting',
  winner_id text,
  host_token text,
  created_at timestamptz default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games on delete cascade,
  candidate_id text not null,
  cp int default 20,
  cr int default 100,
  vote_boost real default 0,
  turn_done boolean default false,
  is_human boolean default true,
  user_token text,
  created_at timestamptz default now()
);

create table game_groups (
  game_id uuid references games on delete cascade,
  dept_id text not null,
  group_idx int not null,
  owner_cand text,
  reinforced boolean default false,
  primary key (game_id, dept_id, group_idx)
);

create table actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games on delete cascade,
  player_id uuid references players,
  turn int not null,
  action_type text not null,
  dept_id text not null,
  group_idx int not null,
  result text,
  created_at timestamptz default now()
);

create index on players (game_id);
create index on game_groups (game_id);
create index on actions (game_id, turn);

alter table games enable row level security;
alter table players enable row level security;
alter table game_groups enable row level security;
alter table actions enable row level security;

create policy "public read games" on games for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read groups" on game_groups for select using (true);
create policy "public read actions" on actions for select using (true);

create policy "insert games" on games for insert with check (true);
create policy "insert players" on players for insert with check (true);
create policy "insert actions" on actions for insert with check (true);
create policy "update players" on players for update using (true);
create policy "upsert groups" on game_groups for all using (true);
create policy "update games" on games for update using (true);

grant all on games, players, game_groups, actions to anon;
