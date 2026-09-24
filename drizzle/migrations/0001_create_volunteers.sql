CREATE TABLE public.volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company_name text NOT NULL,
  iin text NOT NULL,
  phone text NOT NULL,
  activity text NOT NULL DEFAULT '',
  microdistrict text NOT NULL DEFAULT '',
  help_description text NOT NULL DEFAULT '',
  thanked boolean NOT NULL DEFAULT false,
  thanks_text text,
  thanked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.volunteers TO service_role;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;