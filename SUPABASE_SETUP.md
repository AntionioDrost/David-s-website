# Supabase Auth Setup

This static site is wired for Supabase Auth, but the hosted Supabase project details are intentionally kept in `supabase-config.js`.

1. Create or choose a Supabase project.
2. Go to `Project Settings > API` and copy the project URL plus a publishable key.
3. Fill `supabase-config.js`:

```js
window.CMP_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "sb_publishable_..."
};
```

4. In `Authentication > URL Configuration`, set the production site URL to:

```text
https://antioniodrost.github.io/David-s-website/
```

5. Add this redirect URL:

```text
https://antioniodrost.github.io/David-s-website/**
```

For local testing, also add the exact local server URL you use, such as:

```text
http://localhost:8000/**
```

Do not put a `service_role` or secret key in the browser. This site only needs the public project URL and publishable key.

## Dashboard workspace persistence

The dashboard also expects two RLS-protected tables in `public`:

- `cmp_property_compliance_workspaces` stores each user's property A-Z checker answers, document scan previews, extracted facts, and a property snapshot.
- `cmp_ai_preferences` stores the AI document reader provider, endpoint, and a masked key hint.

The schema is documented in `supabase-workspace-schema.sql`.

The raw AI document reader API key is intentionally not saved to Supabase. In this static prototype it is saved only in the user's browser `localStorage`; a production build should move document extraction behind a secure server or Supabase Edge Function.
