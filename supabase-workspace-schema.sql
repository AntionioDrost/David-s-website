create table if not exists public.cmp_property_compliance_workspaces (
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id text not null,
  checker_state jsonb not null default '{}'::jsonb,
  document_scans jsonb not null default '[]'::jsonb,
  extracted_facts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

alter table public.cmp_property_compliance_workspaces enable row level security;

grant select, insert, update on public.cmp_property_compliance_workspaces to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cmp_property_compliance_workspaces'
      and policyname = 'Users can view their own compliance workspaces'
  ) then
    create policy "Users can view their own compliance workspaces"
      on public.cmp_property_compliance_workspaces
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cmp_property_compliance_workspaces'
      and policyname = 'Users can insert their own compliance workspaces'
  ) then
    create policy "Users can insert their own compliance workspaces"
      on public.cmp_property_compliance_workspaces
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cmp_property_compliance_workspaces'
      and policyname = 'Users can update their own compliance workspaces'
  ) then
    create policy "Users can update their own compliance workspaces"
      on public.cmp_property_compliance_workspaces
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.cmp_ai_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'openai',
  endpoint text,
  key_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cmp_ai_preferences enable row level security;

grant select, insert, update on public.cmp_ai_preferences to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cmp_ai_preferences'
      and policyname = 'Users can view their own AI preferences'
  ) then
    create policy "Users can view their own AI preferences"
      on public.cmp_ai_preferences
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cmp_ai_preferences'
      and policyname = 'Users can insert their own AI preferences'
  ) then
    create policy "Users can insert their own AI preferences"
      on public.cmp_ai_preferences
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cmp_ai_preferences'
      and policyname = 'Users can update their own AI preferences'
  ) then
    create policy "Users can update their own AI preferences"
      on public.cmp_ai_preferences
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
