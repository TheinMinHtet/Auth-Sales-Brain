create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.shop_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  shop_id text not null,
  source_id text not null,
  source_type text not null,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, source_id, source_type)
);

create index if not exists shop_knowledge_documents_shop_id_idx
  on public.shop_knowledge_documents (shop_id);

create index if not exists shop_knowledge_documents_embedding_idx
  on public.shop_knowledge_documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shop_knowledge_documents_set_updated_at
on public.shop_knowledge_documents;

create trigger shop_knowledge_documents_set_updated_at
before update on public.shop_knowledge_documents
for each row
execute function public.set_updated_at();

create or replace function public.match_shop_knowledge(
  shop_id_input text,
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  source_id text,
  source_type text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    source_id,
    source_type,
    title,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from public.shop_knowledge_documents
  where shop_id = shop_id_input
  order by embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
