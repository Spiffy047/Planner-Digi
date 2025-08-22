-- Supabase schema for Smart Goal Planner
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text check (role in ('user','admin')) default 'user',
  created_at timestamp default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  target_amount numeric not null,
  saved_amount numeric default 0,
  target_date date not null,
  created_at timestamp default now()
);

alter table goals enable row level security;

create policy "Users can manage own goals" on goals
  for all using (auth.uid() = user_id);
