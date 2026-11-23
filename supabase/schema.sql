-- Esquema previsto para cuando se active el backend (Supabase). Aún NO aplicado.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24),
  points int not null default 0,
  created_at timestamptz default now()
);
create table tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  zone text not null,
  category text not null,
  title text not null check (char_length(title) between 4 and 60),
  body text not null check (char_length(body) between 10 and 400),
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz default now()
);
create table votes (
  tip_id uuid references tips(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  primary key (tip_id, user_id)
);
create table reports (
  id uuid primary key default gen_random_uuid(),
  tip_id uuid references tips(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  reason text,
  unique (tip_id, user_id)
);
alter table profiles enable row level security;
alter table tips enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;
create policy "ver perfiles" on profiles for select using (true);
create policy "editar mi perfil" on profiles for update using (auth.uid() = id);
create policy "ver trucos" on tips for select using (status = 'visible');
create policy "crear mis trucos" on tips for insert with check (auth.uid() = user_id);
create policy "ver votos" on votes for select using (true);
create policy "votar como yo" on votes for insert with check (auth.uid() = user_id);
create policy "cambiar mi voto" on votes for update using (auth.uid() = user_id);
create policy "reportar como yo" on reports for insert with check (auth.uid() = user_id);
-- Pendiente: límite de envíos por hora, puntos calculados en servidor (trigger), y ocultar trucos con muchos reportes.
