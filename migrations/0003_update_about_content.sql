-- Migrate the About section copy from the published lhana.us site.
UPDATE site_settings
SET about_title = 'About LHANA',
    about_body = 'We are a family-owned design studio based in Houston, Texas. We take on projects that inspire us, creating special relationships with our clients. We create spaces that are effortless, practical and budget-friendly. Beauty does not always come with an expensive price tag.
Our family loves to travel, finding inspiration wherever we go. We also love to garden, cook, bake, and explore the outdoor.',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'site';