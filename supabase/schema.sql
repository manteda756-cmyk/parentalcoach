-- ============================================================
-- HealthTrack MCH — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users (mirrors auth.users) ──────────────────────────────
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null unique,
  phone        text not null default '',
  role         text not null check (role in ('admin','supervisor','health_worker','data_clerk','viewer')) default 'health_worker',
  region       text not null default '',
  woreda       text not null default '',
  kebele       text not null default '',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Households ───────────────────────────────────────────────
create table public.households (
  id                    uuid primary key default uuid_generate_v4(),
  registration_number   text not null unique,
  house_number          text not null default '',
  head_name             text not null,
  phone                 text not null default '',
  region                text not null default '',
  woreda                text not null default '',
  kebele                text not null default '',
  gps_lat               numeric,
  gps_lng               numeric,
  vulnerability_status  text not null check (vulnerability_status in ('none','low','medium','high')) default 'none',
  programs              text[] not null default '{}',
  members_count         integer not null default 1,
  registered_by         uuid references public.users(id),
  registered_at         date not null default current_date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── Maternal Records ─────────────────────────────────────────
create table public.maternal_records (
  id                          uuid primary key default uuid_generate_v4(),
  household_id                uuid not null references public.households(id) on delete cascade,
  name                        text not null,
  age                         integer not null,
  phone                       text not null default '',
  status                      text not null check (status in ('pregnant','lactating','both')),
  gestational_age             integer,
  expected_delivery_date      date,
  actual_delivery_date        date,
  anc_visits                  integer not null default 0,
  pnc_visits                  integer not null default 0,
  depression_screening        text not null check (depression_screening in ('not_done','normal','at_risk','positive')) default 'not_done',
  iron_folic_supplementation  boolean not null default false,
  family_support              text not null check (family_support in ('good','moderate','poor')) default 'good',
  nutrition_status            text not null check (nutrition_status in ('normal','malnourished','obese')) default 'normal',
  risk_level                  text not null check (risk_level in ('low','medium','high')) default 'low',
  next_appointment            date,
  missed_appointments         integer not null default 0,
  registered_by               uuid references public.users(id),
  region                      text not null default '',
  woreda                      text not null default '',
  kebele                      text not null default '',
  notes                       text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ── Child Records ────────────────────────────────────────────
create table public.child_records (
  id                      uuid primary key default uuid_generate_v4(),
  household_id            uuid not null references public.households(id) on delete cascade,
  name                    text not null,
  sex                     text not null check (sex in ('male','female')),
  date_of_birth           date not null,
  age_months              integer not null default 0,
  caregiver_name          text not null default '',
  caregiver_phone         text not null default '',
  nutrition_status        text not null check (nutrition_status in ('normal','mam','sam','overweight')) default 'normal',
  muac                    numeric,
  weight                  numeric,
  height                  numeric,
  disability_screening    text not null check (disability_screening in ('none','suspected','confirmed')) default 'none',
  child_protection_flags  text[] not null default '{}',
  next_appointment        date,
  risk_level              text not null check (risk_level in ('low','medium','high')) default 'low',
  registered_by           uuid references public.users(id),
  region                  text not null default '',
  woreda                  text not null default '',
  kebele                  text not null default '',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ── Visit Reports ────────────────────────────────────────────
create table public.visit_reports (
  id                   uuid primary key default uuid_generate_v4(),
  household_id         uuid not null references public.households(id) on delete cascade,
  visit_number         integer not null,
  visit_date           date not null,
  status               text not null check (status in ('draft','submitted','approved','returned')) default 'draft',
  vulnerability_status text not null check (vulnerability_status in ('yes','no')) default 'no',
  psnp_enrollment      text not null check (psnp_enrollment in ('yes','no')) default 'no',
  cbhi_status          text not null check (cbhi_status in ('free','paid','no')) default 'no',
  tds_status           text not null check (tds_status in ('yes','no')) default 'no',
  maternal_section     jsonb,
  child_sections       jsonb not null default '[]',
  risk_flags           jsonb not null default '[]',
  hew_id               uuid not null references public.users(id),
  submitted_at         timestamptz,
  supervisor_id        uuid references public.users(id),
  approved_at          timestamptz,
  returned_at          timestamptz,
  supervisor_comment   text,
  draft_saved_at       timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (household_id, visit_number)
);

-- ── Referrals ────────────────────────────────────────────────
create table public.referrals (
  id                uuid primary key default uuid_generate_v4(),
  patient_id        uuid not null,
  patient_type      text not null check (patient_type in ('maternal','child')),
  patient_name      text not null,
  referral_date     date not null default current_date,
  reason            text not null,
  referred_to       text not null,
  service_received  text,
  follow_up_date    date,
  outcome           text,
  status            text not null check (status in ('pending','in_progress','completed')) default 'pending',
  referred_by       uuid references public.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Appointments ─────────────────────────────────────────────
create table public.appointments (
  id             uuid primary key default uuid_generate_v4(),
  patient_id     uuid not null,
  patient_type   text not null check (patient_type in ('maternal','child')),
  patient_name   text not null,
  date           date not null,
  time           text not null,
  type           text not null,
  health_worker  uuid references public.users(id),
  status         text not null check (status in ('scheduled','completed','missed','cancelled')) default 'scheduled',
  notes          text,
  reminders      text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Notifications ────────────────────────────────────────────
create table public.notifications (
  id                 uuid primary key default uuid_generate_v4(),
  recipient_user_id  uuid not null references public.users(id) on delete cascade,
  type               text not null check (type in ('submission','approval','returned','risk_flag','visit_reminder','resubmit_reminder')),
  title              text not null,
  message            text not null,
  related_report_id  uuid references public.visit_reports(id) on delete set null,
  is_read            boolean not null default false,
  is_urgent          boolean not null default false,
  created_at         timestamptz not null default now()
);

-- ── Storage bucket for attachments ───────────────────────────
insert into storage.buckets (id, name, public)
values ('visit-attachments', 'visit-attachments', false)
on conflict do nothing;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.users           enable row level security;
alter table public.households      enable row level security;
alter table public.maternal_records enable row level security;
alter table public.child_records   enable row level security;
alter table public.visit_reports   enable row level security;
alter table public.referrals       enable row level security;
alter table public.appointments    enable row level security;
alter table public.notifications   enable row level security;

-- Helper: get current user's role
create or replace function public.get_my_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;

-- ── users policies ───────────────────────────────────────────
create policy "Users can read own profile"
  on public.users for select using (id = auth.uid());

create policy "Admins can read all users"
  on public.users for select using (get_my_role() in ('admin','supervisor'));

create policy "Admins can manage users"
  on public.users for all using (get_my_role() = 'admin');

-- ── households policies ──────────────────────────────────────
create policy "Authenticated users can read households"
  on public.households for select using (auth.uid() is not null);

create policy "Health workers and above can insert households"
  on public.households for insert with check (
    get_my_role() in ('admin','supervisor','health_worker','data_clerk')
  );

create policy "Health workers can update their own households"
  on public.households for update using (
    registered_by = auth.uid() or get_my_role() in ('admin','supervisor')
  );

-- ── maternal_records policies ────────────────────────────────
create policy "Authenticated users can read maternal records"
  on public.maternal_records for select using (auth.uid() is not null);

create policy "Health workers can manage maternal records"
  on public.maternal_records for all using (
    get_my_role() in ('admin','supervisor','health_worker','data_clerk')
  );

-- ── child_records policies ───────────────────────────────────
create policy "Authenticated users can read child records"
  on public.child_records for select using (auth.uid() is not null);

create policy "Health workers can manage child records"
  on public.child_records for all using (
    get_my_role() in ('admin','supervisor','health_worker','data_clerk')
  );

-- ── visit_reports policies ───────────────────────────────────
create policy "Health workers can read own visit reports"
  on public.visit_reports for select using (
    hew_id = auth.uid() or get_my_role() in ('admin','supervisor')
  );

create policy "Health workers can create visit reports"
  on public.visit_reports for insert with check (
    hew_id = auth.uid() and get_my_role() in ('health_worker','data_clerk','admin','supervisor')
  );

create policy "Health workers can update own drafts"
  on public.visit_reports for update using (
    (hew_id = auth.uid() and status = 'draft') or get_my_role() in ('admin','supervisor')
  );

-- ── referrals policies ───────────────────────────────────────
create policy "Authenticated users can read referrals"
  on public.referrals for select using (auth.uid() is not null);

create policy "Health workers can manage referrals"
  on public.referrals for all using (
    get_my_role() in ('admin','supervisor','health_worker','data_clerk')
  );

-- ── appointments policies ────────────────────────────────────
create policy "Authenticated users can read appointments"
  on public.appointments for select using (auth.uid() is not null);

create policy "Health workers can manage appointments"
  on public.appointments for all using (
    get_my_role() in ('admin','supervisor','health_worker','data_clerk')
  );

-- ── notifications policies ───────────────────────────────────
create policy "Users can read own notifications"
  on public.notifications for select using (recipient_user_id = auth.uid());

create policy "Users can mark own notifications as read"
  on public.notifications for update using (recipient_user_id = auth.uid());

-- ── Storage policies ─────────────────────────────────────────
create policy "Authenticated users can upload"
  on storage.objects for insert with check (
    bucket_id = 'visit-attachments' and auth.uid() is not null
  );

create policy "Authenticated users can read"
  on storage.objects for select using (
    bucket_id = 'visit-attachments' and auth.uid() is not null
  );

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger households_updated_at      before update on public.households      for each row execute function public.handle_updated_at();
create trigger maternal_updated_at        before update on public.maternal_records  for each row execute function public.handle_updated_at();
create trigger child_updated_at           before update on public.child_records    for each row execute function public.handle_updated_at();
create trigger visit_reports_updated_at   before update on public.visit_reports   for each row execute function public.handle_updated_at();
create trigger referrals_updated_at       before update on public.referrals       for each row execute function public.handle_updated_at();
create trigger appointments_updated_at    before update on public.appointments    for each row execute function public.handle_updated_at();

-- ============================================================
-- Auto-create user profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'health_worker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
