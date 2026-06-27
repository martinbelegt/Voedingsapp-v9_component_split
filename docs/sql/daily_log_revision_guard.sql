begin;

alter table public.daily_logs
add column if not exists revision integer not null default 0;

alter table public.daily_logs enable row level security;

revoke insert, update, delete on table public.daily_logs
from anon, authenticated, public;

grant select on table public.daily_logs
to anon, authenticated;

drop policy if exists "daily_logs_read_anon" on public.daily_logs;

create policy "daily_logs_read_anon"
on public.daily_logs
for select
to anon, authenticated
using (true);

create or replace function public.save_daily_log_if_revision_matches(
  expected_revision integer,
  next_data jsonb
)
returns table(success boolean, next_revision integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_revision integer;
begin
  update public.daily_logs
  set
    data = next_data,
    updated_at = now(),
    revision = revision + 1
  where date = 'main'
    and revision = expected_revision
  returning revision into updated_revision;

  if updated_revision is null then
    return query
    select false, dl.revision
    from public.daily_logs dl
    where dl.date = 'main';

    return;
  end if;

  return query select true, updated_revision;
end;
$$;

revoke all on function public.save_daily_log_if_revision_matches(integer, jsonb)
from public;

grant execute on function public.save_daily_log_if_revision_matches(integer, jsonb)
to anon, authenticated;

commit;
