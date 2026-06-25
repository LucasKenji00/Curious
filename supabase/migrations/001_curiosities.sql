create table curiosities (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  angle text,
  surprise_type text,
  hook text not null,
  body text not null,
  deep_dive text,
  tags text[],
  created_at timestamp with time zone default now(),
  used_count integer default 0
);

create index on curiosities (category);
create index on curiosities (created_at);
