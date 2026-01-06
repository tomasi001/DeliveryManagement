-- Create sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text not null,
  client_email text,
  address text,
  status text check (status in ('active', 'ready_for_pickup', 'archived')) default 'active'
);

-- Create artworks table
create table if not exists artworks (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  wac_code text not null,
  artist text,
  title text,
  status text check (status in ('in_stock', 'in_truck', 'delivered', 'returned')) default 'in_stock'
);

-- Enable Row Level Security
alter table sessions enable row level security;
alter table artworks enable row level security;

-- Policies
-- 1. Allow read access to everyone
create policy "Enable read access for all users" on sessions for select using (true);
create policy "Enable read access for all users" on artworks for select using (true);

-- 2. Allow write access to AUTHENTICATED users only
create policy "Enable insert for authenticated users" on sessions for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on sessions for update using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on artworks for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on artworks for update using (auth.role() = 'authenticated');
