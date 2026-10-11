create table if not exists connections (
    user_id UUID not null references users(id) on delete cascade,
    provider text not null check (provider in ('calendar', 'meet')),
    status text not null check (status in ('connected', 'disconnected', 'pending')),
    primary key (user_id, provider)
);