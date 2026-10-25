CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY NOT NULL CHECK (id = 'site'),
  hero_location TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_link TEXT NOT NULL,
  work_title TEXT NOT NULL,
  projects_title TEXT NOT NULL,
  projects_intro TEXT NOT NULL,
  about_title TEXT NOT NULL,
  about_body TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_location TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  type TEXT NOT NULL CHECK (trim(type) <> ''),
  description TEXT NOT NULL,
  position INTEGER NOT NULL UNIQUE CHECK (position > 0),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  visible INTEGER NOT NULL DEFAULT 1 CHECK (visible IN (0, 1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_images (
  id TEXT PRIMARY KEY NOT NULL,
  project_slug TEXT NOT NULL REFERENCES projects(slug) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL CHECK (trim(alt_text) <> ''),
  position INTEGER NOT NULL CHECK (position > 0),
  UNIQUE (project_slug, position)
);

INSERT OR IGNORE INTO site_settings
  (id, hero_location, hero_title, hero_link, work_title, projects_title, projects_intro, about_title, about_body,
   contact_title, contact_email, contact_phone, contact_location, updated_at)
VALUES
  ('site', 'Houston, Texas', 'LHANA', 'Selected work', 'Selected work',
   'Our projects', 'A collection of homes and shared spaces, each designed with care for the way people live.',
   'A family-owned design studio in Houston.',
   'We create thoughtful, practical interiors inspired by nature and made for everyday life. Beauty doesn''t have to come with an extravagant price tag.',
   'Get in touch', 'quynh@lhana.us', '713 516 4683', 'Houston, Texas', CURRENT_TIMESTAMP);
