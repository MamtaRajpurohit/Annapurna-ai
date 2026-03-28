# Database Assets

This folder contains Firestore setup assets:

- `firestore.rules` - open demo rules (replace with stricter auth rules for production)
- `firestore.indexes.json` - sample index
- `seed-ngos.json` - NGO master data for reference

## Import seed data (optional)

Use Firebase console or a script to import `seed-ngos.json` into a collection like `ngos`.
The backend currently uses local NGO data in `backend/src/data/ngos.js` for predictable demos.
