create table estudios (
  id          bigint generated always as identity primary key,
  titulo      text not null,
  bajada      text,
  tema        text,
  alcance     text,           -- "En Argentina", "Global", provincia, etc.
  fecha       text,           -- legible: "Mayo 2026"
  fecha_orden date,           -- YYYY-MM-DD, define el orden del índice
  url         text not null,  -- /estudios/<slug> o URL externa (interim)
  imagen      text,           -- portada card (ratio 3:2)
  destacado   boolean default false,
  insights    text[]          -- puntos destacados para la card (opcional)
);

create table visualizaciones (
  id           bigint generated always as identity primary key,
  titulo       text not null,
  descripcion  text,
  imagen       text,
  estudio_url  text            -- FK lógica a estudios.url
);

create table comentarios (
  id      bigint generated always as identity primary key,
  nombre  text,
  email   text,
  mensaje text not null,
  creado  timestamptz default now()
);

alter table estudios        enable row level security;
alter table visualizaciones enable row level security;
alter table comentarios     enable row level security;

create policy "lectura publica"  on estudios        for select using (true);
create policy "lectura publica"  on visualizaciones for select using (true);
create policy "insert publico"   on comentarios     for insert with check (
  char_length(mensaje) between 1 and 2000 and char_length(coalesce(nombre,'')) <= 120
);
-- comentarios NO tiene policy de select: solo se leen desde el dashboard de Supabase.
