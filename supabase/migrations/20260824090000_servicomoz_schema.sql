create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client','professional','admin')),
  full_name text,
  email text,
  whatsapp text,
  phone text,
  province text,
  city text,
  neighborhood text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.professional_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text check (char_length(bio) <= 140), macro_category text, subcategory text, description text check (char_length(description) <= 500),
  modality text check (modality in ('presencial','remoto','ambos')), price_model text check (price_model in ('hora','servico','negociar')),
  price_min numeric, price_max numeric, lat numeric, lng numeric, cover_url text, portfolio_url text, experience_years int,
  languages text[] not null default '{}', available_now boolean not null default false, contact_email text, contact_whatsapp text, contact_phone text,
  show_email boolean not null default true, show_whatsapp boolean not null default true, show_phone boolean not null default true,
  account_status text not null default 'pending' check (account_status in ('pending','approved','suspended')),
  kyc_front_url text, kyc_back_url text, kyc_selfie_url text, kyc_status text not null default 'none' check (kyc_status in ('none','pending','approved','rejected')),
  kyc_rejection_reason text, featured boolean not null default false, verified_badge boolean not null default false,
  level text not null default 'iniciante' check (level in ('iniciante','confirmado','experiente','elite')), trust_score int not null default 0,
  rating_avg numeric not null default 0, rating_count int not null default 0, follower_count int not null default 0, post_count int not null default 0,
  views_count int not null default 0, weekly_rank int, badges text[] not null default '{}', updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly','quarterly')), status text not null default 'pending' check (status in ('pending','active','expired','suspended')),
  price_paid numeric, starts_at timestamptz, expires_at timestamptz, approved_by_admin_at timestamptz, admin_notes text, created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('work','before_after','promotion','availability','tip')), caption text check (char_length(caption) <= 500), hashtags text[] not null default '{}',
  location_tag text, category_tag text, media_urls text[] not null default '{}', like_count int not null default 0, comment_count int not null default 0,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')), rejection_reason text, created_at timestamptz not null default now()
);

create table if not exists public.post_likes (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique(post_id,user_id));
create table if not exists public.post_comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, parent_comment_id uuid references public.post_comments(id) on delete cascade, content text not null, created_at timestamptz not null default now());
create table if not exists public.post_saves (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique(post_id,user_id));
create table if not exists public.follows (id uuid primary key default gen_random_uuid(), follower_id uuid not null references public.profiles(id) on delete cascade, following_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique(follower_id,following_id), check(follower_id <> following_id));
create table if not exists public.job_posts (id uuid primary key default gen_random_uuid(), client_id uuid not null references public.profiles(id) on delete cascade, title text not null, description text not null check(char_length(description)<=400), macro_category text, province text, city text, budget_min numeric, budget_max numeric, urgency text not null default 'normal' check(urgency in ('normal','urgente')), expires_at timestamptz, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.job_interests (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.job_posts(id) on delete cascade, professional_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique(post_id,professional_id));
create table if not exists public.conversations (id uuid primary key default gen_random_uuid(), participant_a uuid not null references public.profiles(id), participant_b uuid not null references public.profiles(id), last_message text, last_message_at timestamptz, created_at timestamptz not null default now(), unique(participant_a,participant_b), check(participant_a<>participant_b));
create table if not exists public.messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade, sender_id uuid not null references public.profiles(id), content text not null, read boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.reviews (id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.profiles(id) on delete cascade, client_id uuid not null references public.profiles(id) on delete cascade, rating int not null check(rating between 1 and 5), comment text, professional_reply text, created_at timestamptz not null default now(), unique(professional_id,client_id));
create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, type text not null, from_user_id uuid references public.profiles(id), reference_id uuid, read boolean not null default false, body text, created_at timestamptz not null default now());
create table if not exists public.reports (id uuid primary key default gen_random_uuid(), reported_user_id uuid not null references public.profiles(id) on delete cascade, reporter_id uuid not null references public.profiles(id) on delete cascade, reported_post_id uuid references public.posts(id) on delete set null, report_type text not null check(report_type in ('profile','post')), reason text not null, reason_detail text, status text not null default 'open', admin_note text, created_at timestamptz not null default now(), resolved_at timestamptz);

create index if not exists posts_approved_created_idx on public.posts(approval_status,created_at desc);
create index if not exists professional_status_idx on public.professional_profiles(account_status,verified_badge);
create index if not exists subscriptions_expiry_idx on public.subscriptions(status,expires_at);
create index if not exists notifications_user_read_idx on public.notifications(user_id,read,created_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id,created_at);

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_saves enable row level security;
alter table public.follows enable row level security;
alter table public.job_posts enable row level security;
alter table public.job_interests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') or coalesce(auth.jwt()->>'email','')='euclidesdomingos066@gmail.com'; $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,full_name,role) values(new.id,new.email,new.raw_user_meta_data->>'full_name',case when new.email='euclidesdomingos066@gmail.com' then 'admin' else coalesce(new.raw_user_meta_data->>'role','client') end) on conflict(id) do update set email=excluded.email, full_name=coalesce(excluded.full_name,profiles.full_name), role=excluded.role; if coalesce(new.raw_user_meta_data->>'role','client')='professional' then insert into public.professional_profiles(id) values(new.id) on conflict do nothing; end if; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create policy "profiles self or admin" on public.profiles for all using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy "profiles visible" on public.profiles for select using(auth.uid() is not null);
create policy "professional public approved" on public.professional_profiles for select using(account_status='approved' or id=auth.uid() or public.is_admin());
create policy "professional self admin" on public.professional_profiles for all using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy "subscriptions own admin" on public.subscriptions for all using(professional_id=auth.uid() or public.is_admin()) with check(professional_id=auth.uid() or public.is_admin());
create policy "approved posts visible" on public.posts for select using(approval_status='approved' or professional_id=auth.uid() or public.is_admin());
create policy "post owner admin write" on public.posts for all using(professional_id=auth.uid() or public.is_admin()) with check(professional_id=auth.uid() or public.is_admin());
create policy "likes authenticated" on public.post_likes for select using(auth.uid() is not null);
create policy "likes own" on public.post_likes for insert with check(user_id=auth.uid());
create policy "likes delete own" on public.post_likes for delete using(user_id=auth.uid() or public.is_admin());
create policy "comments approved" on public.post_comments for select using(exists(select 1 from public.posts p where p.id=post_id and p.approval_status='approved') or user_id=auth.uid() or public.is_admin());
create policy "comments own" on public.post_comments for insert with check(user_id=auth.uid());
create policy "comments delete own" on public.post_comments for delete using(user_id=auth.uid() or public.is_admin());
create policy "saves own" on public.post_saves for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "follows authenticated" on public.follows for select using(auth.uid() is not null);
create policy "follows own" on public.follows for insert with check(follower_id=auth.uid());
create policy "unfollow own" on public.follows for delete using(follower_id=auth.uid() or public.is_admin());
create policy "jobs authenticated" on public.job_posts for select using(auth.uid() is not null);
create policy "jobs own" on public.job_posts for all using(client_id=auth.uid() or public.is_admin()) with check(client_id=auth.uid() or public.is_admin());
create policy "job interests authenticated" on public.job_interests for select using(auth.uid() is not null);
create policy "job interests own" on public.job_interests for insert with check(professional_id=auth.uid());
create policy "conversations participants" on public.conversations for select using(participant_a=auth.uid() or participant_b=auth.uid() or public.is_admin());
create policy "conversation create participant" on public.conversations for insert with check(participant_a=auth.uid() or participant_b=auth.uid());
create policy "messages participants" on public.messages for select using(exists(select 1 from public.conversations c where c.id=conversation_id and (c.participant_a=auth.uid() or c.participant_b=auth.uid())) or public.is_admin());
create policy "messages sender" on public.messages for insert with check(sender_id=auth.uid() and exists(select 1 from public.conversations c where c.id=conversation_id and (c.participant_a=auth.uid() or c.participant_b=auth.uid())));
create policy "messages update participant" on public.messages for update using(exists(select 1 from public.conversations c where c.id=conversation_id and (c.participant_a=auth.uid() or c.participant_b=auth.uid())) or public.is_admin());
create policy "reviews authenticated" on public.reviews for select using(auth.uid() is not null);
create policy "reviews client" on public.reviews for insert with check(client_id=auth.uid());
create policy "reviews owner reply" on public.reviews for update using(professional_id=auth.uid() or public.is_admin()) with check(professional_id=auth.uid() or public.is_admin());
create policy "notifications own" on public.notifications for select using(user_id=auth.uid() or public.is_admin());
create policy "notifications own update" on public.notifications for update using(user_id=auth.uid() or public.is_admin());
create policy "reports authenticated insert" on public.reports for insert with check(reporter_id=auth.uid());
create policy "reports admin" on public.reports for select using(public.is_admin());
create policy "reports admin update" on public.reports for update using(public.is_admin());

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
