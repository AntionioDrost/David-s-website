# CMP Build Order

Build and review the prototypes in this order:

1. CMP Prime
2. Manual review
3. Netlify preview for CMP Prime only
4. CMP Vault
5. Manual review
6. Netlify preview for CMP Vault only
7. CMP Concierge
8. Manual review
9. Netlify preview for CMP Concierge only
10. Comparison page after all three exist

## Deployment Rules

- Do not build multiple prototypes in one prompt.
- Do not deploy the repository root.
- When creating a Netlify draft deploy, deploy only the relevant prototype folder.
- Do not use `--prod`.

Example:

```bash
netlify deploy --dir=prototypes/cmp-prime
```
