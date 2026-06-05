# Plan: Multi-type profiles with mixed content

Turn ProjectAtlas from a "projects only" link-in-bio into a unified profile that any builder — freelancer, developer, designer, or someone showing off skills/qualifications — can use.

## 1. Profile type onboarding

On first sign-in (and from the dashboard), the user picks a profile type:

- **Developer** — projects, repos, demos
- **Designer** — portfolio pieces, case studies
- **Freelancer** — services, projects, testimonials
- **Creator / Other** — anything goes

Stored on `profiles.profile_type`. Used to tailor:

- Which sections appear by default on the public profile page (`/u/$id`)
- The default "Add item" picker on the dashboard
- Suggested tag categories

Onboarding is a short modal that appears on `/dashboard` if `profile_type` is null. Skippable → defaults to "Creator".

## 2. Unified items on one public page

Every profile gets a single public page (`/u/$id`) that shows ALL their items in one feed, grouped by type with tabs:

```text
[ Projects ]  [ Services ]  [ Skills ]  [ Highlights ]
   3 cards      2 cards      grid         2 cards
```

A new `profile_items` table holds all non-project items. Existing `projects` table stays as-is for URL-based projects so the analyzer keeps working.

Item types:

- **project** — already exists in `projects`
- **service** — title, description, price range, deliverables, tags (freelancer)
- **highlight** — resume/experience item: role, org, dates, summary
- **skill** — name, level (1-5), years, category
- **qualification** — credential name, issuer, date, optional URL

## 3. Skills / qualifications profile mode

Even without a single project URL, a user can build a portfolio of:

- A "Skills" grid (name + level + category)
- A "Qualifications" list (cert, degree, course, award)
- A "Highlights" timeline (experience / case studies)

These render on the public profile and are searchable on the discovery page by tag.

## 4. Custom categories and tags

- A small `profile_tags` table lets each user define their own tags (skills, services, credentials) with a `kind` (`skill | service | credential | topic`).
- When adding any item, the user picks from their own tags + the suggested defaults for their profile type.
- The discover page (`/`) gets a new "Browse by" filter: People / Projects / Services / Skills.

## Technical details

**Database (one migration):**

- `profiles`: add `profile_type text`, `headline text`, `tags text[] default '{}'`.
- New `profile_items` table:
  - `id`, `owner_id`, `type` (enum: service/highlight/skill/qualification), `title`, `subtitle`, `body`, `meta jsonb` (price/level/dates/issuer/url), `tags text[]`, `position int`, `published bool`, timestamps.
  - RLS: public read where published, owner full access. Grants for `anon` SELECT + `authenticated` ALL + `service_role`.
- New `profile_tags` table: `id`, `owner_id`, `kind`, `label`, unique (owner_id, kind, label). RLS: owner only. Public can read via join through items.

**Frontend:**

- `src/components/ProfileTypeOnboarding.tsx` — modal launched from `/dashboard`.
- `src/routes/dashboard.tsx` — new "Add item" dropdown (Project URL / Service / Skill / Qualification / Highlight) + manage lists for each.
- `src/routes/u.$id.tsx` — tabbed feed (Projects / Services / Skills / Qualifications / Highlights), conditional on what the user has added.
- `src/components/items/*` — small renderers: `ServiceCard`, `SkillBadge`, `QualificationRow`, `HighlightCard`.
- `src/routes/index.tsx` — discover filter (People / Projects / Services / Skills).

**Server fns** (`src/lib/profile-items.functions.ts`):

- `createProfileItem`, `updateProfileItem`, `deleteProfileItem`, `reorderProfileItems` — all `requireSupabaseAuth`.
- Listing happens client-side via the browser Supabase client (RLS already filters by `published`).

**Out of scope for this pass:**

- Drag-to-reorder UI (we'll ship up/down arrows, can polish later).
- Paid services / Stripe integration.
- Profile themes beyond the current gradient.

## Order of work

1. Migration: `profile_type`, `headline`, `profile_items`, `profile_tags`, RLS, grants.
2. Onboarding modal + dashboard "Add item" forms.
3. Render new sections on `/u/$id`.
4. Discover filter on `/`.
5. Update home-page copy (already broadened earlier).
