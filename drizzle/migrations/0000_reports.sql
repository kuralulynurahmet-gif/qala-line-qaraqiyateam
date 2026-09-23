CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  microdistrict text NOT NULL,
  address text NOT NULL DEFAULT '',
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  photo_url text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  status text NOT NULL DEFAULT 'new',
  staff_comment text,
  resolved_photo_url text,
  ai_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

INSERT INTO public.reports (code, full_name, phone, microdistrict, address, category, description, photo_url, lat, lng, status, staff_comment, created_at) VALUES
('#AKT-2026-1042','Айгүл Серікова','+77011234567','5','5-шағынаудан, 12-үй маңы','pothole','Жолдың ортасында терең шұңқыр пайда болды, көліктер айналып өтеді.','/demo/pothole.jpg',43.6512,51.1601,'new',NULL, now() - interval '1 day'),
('#AKT-2026-1043','Ерлан Жұмабаев','+77029876543','3','3-шағынаудан, мектеп жанындағы аула','manhole','Балалар ойнайтын жерде люк қақпағы жоқ. Өте қауіпті!','/demo/manhole.jpg',43.6583,51.1532,'in_progress','Қақпақ тапсырыс берілді, ертең орнатылады.', now() - interval '2 days'),
('#AKT-2026-1044','Динара Қасымова','+77051112233','14','14-шағынаудан, 40-үй','light','Аулада үш шам бір апта бойы жанбайды.','/demo/streetlight.jpg',43.6391,51.1802,'done','Шамдар ауыстырылды. Рахмет!', now() - interval '6 days'),
('#AKT-2026-1045','Нұрлан Әбенов','+77074445566','12','12-шағынаудан, Тәуелсіздік даңғылы','trash','Қоқыс контейнерлері толып, айналасы ластанған.','/demo/trash.jpg',43.6450,51.1728,'new',NULL, now() - interval '5 hours'),
('#AKT-2026-1046','Сәуле Төлегенова','+77087778899','7','7-шағынаудан, Н. Назарбаев даңғылы','bus_stop','Аялдаманың шатыры сынған, әйнектері шашылған.',NULL,43.6528,51.1685,'in_progress','Қоғамдық көлік бөліміне жіберілді.', now() - interval '3 days'),
('#AKT-2026-1047','Бауыржан Сейітов','+77013332211','27','27-шағынаудан, 5-үй','water','Кәріз құбыры жарылып, су көшеге ағып жатыр.',NULL,43.6690,51.2105,'new',NULL, now() - interval '12 hours'),
('#AKT-2026-1048','Мадина Құрманова','+77025554433','15','15-шағынаудан, 18-үй','signs','«Жаяу жүргінші өткелі» белгісі құлап қалған.',NULL,43.6348,51.1858,'done','Белгі қайта орнатылды.', now() - interval '9 days'),
('#AKT-2026-1049','Арман Досанов','+77076667788','11','11-шағынаудан, 2-үй ауласы','yard','Балалар алаңындағы әткеншек сынған.',NULL,43.6475,51.1655,'rejected','Аула жеке ПИК балансында, ПИК-ке жүгінуіңізді сұраймыз.', now() - interval '8 days'),
('#AKT-2026-1050','Гүлнар Ахметова','+77048889900','1','1-шағынаудан, Каспий жағалауы','light','Жағалау жолындағы шамдар жанбайды.',NULL,43.6605,51.1435,'in_progress','Электрик бригадасы жіберілді.', now() - interval '1 day'),
('#AKT-2026-1051','Қайрат Бекбосын','+77051230987','29','29-шағынаудан, 10-үй','pothole','Кіреберістегі асфальт толық бұзылған.',NULL,43.6788,51.1990,'new',NULL, now() - interval '3 hours');