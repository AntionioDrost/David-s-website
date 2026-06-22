# CMP V2 Homepage Rollback Notes

Rollback is homepage-scoped.

To revert this implementation, revert the commit titled:
`Implement selected CMP hybrid V2 homepage`

Expected files removed or restored by rollback:
- `public-pages.js`
- `landing.css`
- `assets/generated/public-homepage-v2/`
- `audit/2026-06-23-cmp-v2-homepage-implementation/`

No dashboard, storage, Supabase, Add Property, My Properties, service logic or Netlify files were edited for this stage.

If a partial manual rollback is needed, restore `public-pages.js` and `landing.css` from `visual/cmp-wix-public-alignment-v1`, then remove the copied V2 homepage asset folder and this audit folder.
