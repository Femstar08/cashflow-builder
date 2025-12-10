# Migration to InstantDB

This document summarizes the migration from Supabase to InstantDB.

## What Changed

### Database Backend
- **Before**: Supabase (PostgreSQL with REST API)
- **After**: InstantDB (real-time database with React hooks)

### Key Benefits
1. **Real-time updates**: InstantDB provides automatic real-time subscriptions
2. **Simpler setup**: No need for separate auth helpers or complex RLS policies
3. **Better DX**: Type-safe schema definitions with automatic client generation

### Architecture Changes

#### Client-Side
- Uses `@instantdb/react` hooks for real-time data subscriptions
- Schema defined in `src/lib/instantdb/schema.ts`
- Client initialized in `src/lib/instantdb/client.ts`

#### Server-Side
- Uses `@instantdb/admin` SDK for API routes
- Service layer in `src/lib/instantdb/service.ts`
- All data operations go through service wrappers in `src/lib/data/`

### Environment Variables

**Old (Supabase):**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**New (InstantDB):**
```
NEXT_PUBLIC_INSTANT_APP_ID=...
INSTANT_ADMIN_TOKEN=...
```

### File Structure

```
src/lib/
├── instantdb/
│   ├── schema.ts          # Schema definitions
│   ├── client.ts           # Client initialization
│   └── service.ts          # Server-side service layer
└── data/
    ├── profile-service.ts      # Now uses InstantDB
    ├── scenario-service.ts      # Now uses InstantDB
    ├── line-item-service.ts    # Now uses InstantDB
    └── recommendation-service.ts # Now uses InstantDB
```

### Migration Notes

1. **Mock Data Fallback**: The app gracefully falls back to mock data when InstantDB credentials are missing
2. **API Compatibility**: All service functions maintain the same interface, so components didn't need changes
3. **Schema Mapping**: The InstantDB schema matches the previous Supabase structure

### Next Steps

1. Set up your InstantDB account and get credentials
2. Add credentials to `.env.local`
3. Run `npm run dev` to start the app
4. Test the profile creation and dashboard flows

### Troubleshooting

- **"InstantDB credentials not configured"**: Add your credentials to `.env.local`
- **Data not persisting**: Check that `INSTANT_ADMIN_TOKEN` is set correctly
- **Real-time updates not working**: Ensure `NEXT_PUBLIC_INSTANT_APP_ID` is set

