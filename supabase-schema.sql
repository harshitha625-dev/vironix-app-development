-- VEYTRIX Supabase schema. Run in the Supabase SQL editor.
-- Mirrors src/types/index.ts — keep both in sync if you change this.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','plus','pro','premium')),
  credits int not null default 20,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('text_to_video','image_to_video','reference_video','manual_edit')),
  status text not null default 'draft' check (status in ('draft','queued','generating','processing','completed','failed')),
  prompt text,
  params jsonb not null default '{}',
  thumbnail_url text,
  output_url text,
  credits_cost int not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('recharge','spend','refund','promo','bonus')),
  amount int not null,
  balance_after int not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null check (category in ('generation','credits','updates','security','maintenance')),
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.devices (
  user_id uuid not null references public.users(id) on delete cascade,
  push_token text not null,
  platform text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, push_token)
);

-- Row Level Security: every table scoped to auth.uid()
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.devices enable row level security;

create policy "own row" on public.users for select using (auth.uid() = id);
create policy "own row update" on public.users for update using (auth.uid() = id);

create policy "own projects" on public.projects for all using (auth.uid() = user_id);
create policy "own transactions" on public.credit_transactions for select using (auth.uid() = user_id);
create policy "own notifications" on public.notifications for all using (auth.uid() = user_id);
create policy "own devices" on public.devices for all using (auth.uid() = user_id);

-- Atomic credit operations so concurrent generations can't double-spend.
create or replace function public.deduct_credits(p_user_id uuid, p_amount int, p_description text)
returns void as $$
declare v_balance int;
begin
  select credits into v_balance from public.users where id = p_user_id for update;
  if v_balance is null or v_balance < p_amount then
    raise exception 'Insufficient credits';
  end if;
  update public.users set credits = credits - p_amount where id = p_user_id;
  insert into public.credit_transactions (user_id, type, amount, balance_after, description)
    values (p_user_id, 'spend', -p_amount, v_balance - p_amount, p_description);
end;
$$ language plpgsql security definer;

create or replace function public.add_credits(p_user_id uuid, p_amount int, p_description text)
returns void as $$
declare v_balance int;
begin
  select credits into v_balance from public.users where id = p_user_id for update;
  update public.users set credits = coalesce(v_balance, 0) + p_amount where id = p_user_id;
  insert into public.credit_transactions (user_id, type, amount, balance_after, description)
    values (p_user_id, 'recharge', p_amount, coalesce(v_balance, 0) + p_amount, p_description);
end;
$$ language plpgsql security definer;

-- Auto-create a public.users row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Realtime on projects so the Progress screen gets live status pushes.
alter publication supabase_realtime add table public.projects;
