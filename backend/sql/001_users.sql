create extension if not exists pgcrypto;

create table if not exists users (
    id UUID primary key default gen_random_uuid(),
    auth_user_id text not null unique,
    email text,
    created_at timestamptz not null default now()
);