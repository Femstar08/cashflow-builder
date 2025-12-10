# Cashflow Builder Implementation Plan

## 1. Project Scaffold & Tooling ✅

- ✅ Created Next.js (App Router) + TypeScript project with Tailwind CSS
- ✅ Set up shared UI primitives (layout shell, navigation bar, theme config) under `app/`, `components/ui/`, and `lib/`
- ✅ Installed foundational deps: InstantDB client, Zustand, TanStack Query, charting (Recharts), AG Grid, ExcelJS, OpenAI SDK

## 2. InstantDB Integration & Data Model ✅

- ✅ Defined schema in `lib/instantdb/schema.ts` with all required tables
- ✅ Created client helper in `lib/instantdb/client.ts` plus server-side service wrappers in `lib/instantdb/service.ts`
- ✅ Model tables: `business_profiles`, `cashflow_scenarios`, `line_items`, `ai_recommendations` with generated types in `types/database.ts`
- ✅ Implemented API route handlers in `app/api` for CRUD on profiles, scenarios, line items, and AI recommendation logging
- ✅ All service files updated to use InstantDB instead of Supabase

## 3. Business Profile Intake Flow ✅

- ✅ Built multi-step form at `app/profile/new/page.tsx` to capture URL/details
- ✅ Added server action that fetches metadata and calls LLM to draft profile fields
- ✅ Added free-form notes field for collaboration between accountants and clients
- ✅ Store editable draft in InstantDB with fallback to mock data
- ✅ Provided review/edit UI with AI "regenerate/suggest" buttons

## 4. Cash Flow Workspace & Dashboard ✅

- ✅ Created dashboard route `app/dashboard/[profileId]/page.tsx` loading profile + default scenario via Suspense/TanStack Query
- ✅ Implemented interactive grid component in `components/cashflow/cashflow-grid.tsx` using AG Grid with editable monthly values
- ✅ Added horizon selector support (1/3/5/10y) in scenario structure
- ✅ Added scenario cloning functionality
- ✅ Implemented inline AI suggestions sidebar
- ✅ Added live charts (burn, runway, EBITDA) fed by derived data utilities in `lib/cashflow/calculations.ts`
- ✅ Fixed burn calculation to use actual series length instead of hardcoded 12

## 5. AI Recommendation Services ✅

- ✅ Centralized LLM calls in `lib/ai/` with prompt templates for profile creation, line-item suggestions, and narrative insights
- ✅ Exposed recommendations via API route `/api/recommendations/generate` used by dashboard sidebar
- ✅ Persist accept/reject events in InstantDB

## 6. Excel Export Pipeline ✅

- ✅ Implemented server route `/api/export` that assembles requested scenario(s) into Excel via ExcelJS
- ✅ Embedding monthly data, formulas, named ranges, and scenario tabs
- ✅ Fixed formula construction to properly group revenue and expense calculations
- ✅ Fixed error handling to properly destructure and report InstantDB errors
- ✅ Provided client-side export button wiring + download handling in dashboard

## 7. Collaborative Workflow Support ✅

- ✅ Added collaborator invite UI component in dashboard
- ✅ Extended `business_profiles` metadata to store collaborator information
- ✅ Sequential collaboration workflow (invite another user who can edit later)

## 8. Guided User Journey UI ✅

- ✅ Restructured primary navigation/landing to emphasize sequential steps: 1) Create business profile, 2) Build cashflow, 3) Review/export
- ✅ Added contextual prompts and stepper component guiding users through the journey on homepage and dashboard
- ✅ Updated navigation to highlight the profile→cashflow journey

## 9. Testing, Validation & Polish ✅

- ✅ Added unit tests for calculation utilities and AI prompt serializers (Vitest) under `tests/`
- ✅ Fixed dashboard source map error by removing `--no-turbo` flag
- ✅ Fixed Button component to properly handle `asChild` prop
- ✅ Documented environment variables, InstantDB schema, and run instructions in `README.md`
- ✅ Created `MIGRATION.md` documenting the Supabase to InstantDB migration

## Current Status

**Phase 1 (Completed):** Core functionality implemented
- ✅ Project scaffold and tooling
- ✅ InstantDB integration
- ✅ Business profile intake with AI
- ✅ Basic cashflow dashboard
- ✅ Excel export (basic)
- ✅ Collaborative workflow support
- ✅ Guided user journey UI

**Phase 2 (Pending - Per spec.md):** Advanced features required
- ⏳ Advanced accounting basis (Accrual/Cash with working capital)
- ⏳ VAT calculations (Accrual/Cash basis)
- ⏳ Corporation Tax calculations
- ⏳ PAYE/NIC calculations
- ⏳ Dividend modeling
- ⏳ Event Tree system
- ⏳ Presenter Mode UI (detailed implementation)
- ⏳ Enhanced AI recommendations
- ⏳ Internal-only access control
- ⏳ Enhanced Excel export with full formulas

## Implementation Plan Based on spec.md

### Phase 2.1: Database Schema Extensions
- [ ] Extend `business_profiles` schema with:
  - `entity_type`: "limited_company" | "sole_trader"
  - `accounting_basis`: "accrual" | "cash"
  - `vat_enabled`: boolean
  - `vat_basis`: "accrual" | "cash"
  - `include_corporation_tax`: boolean
  - `include_paye_nic`: boolean
  - `include_dividends`: boolean
  - `debtor_days`: number
  - `creditor_days`: number
  - `director_salary`: number
  - `dividend_payout_ratio`: number (0-1)
- [ ] Create `events` table in InstantDB schema
- [ ] Update TypeScript types in `types/database.ts`

### Phase 2.2: Business Settings UI
- [ ] Create `BusinessSettingsForm` component
- [ ] Add entity type selector
- [ ] Add accounting basis toggle
- [ ] Add VAT configuration section
- [ ] Add tax toggles (CT, PAYE/NIC, Dividends)
- [ ] Add working capital inputs
- [ ] Implement validation logic per spec requirements
- [ ] Integrate settings into profile intake flow

### Phase 2.3: Forecast Engine Enhancements
- [ ] Implement accrual basis calculations with working capital
- [ ] Implement cash basis calculations
- [ ] Add VAT calculation engine (all scenarios)
- [ ] Add Corporation Tax calculation engine
- [ ] Add PAYE/NIC calculation engine
- [ ] Add Dividend calculation engine
- [ ] Update `lib/cashflow/calculations.ts` with all new logic
- [ ] Ensure multi-year forecast support (1/3/5/10 years)

### Phase 2.4: Event Tree System
- [ ] Create `EventTree` component
- [ ] Implement event CRUD operations
- [ ] Add event application logic to forecast engine
- [ ] Create event timeline visualization
- [ ] Integrate events into dashboard

### Phase 2.5: Presenter Mode (Detailed Implementation)
- [ ] Create `PresenterMode` component with full layout
- [ ] Implement header bar (business info, toggles, exit button)
- [ ] Create metric cards row (5 key metrics)
- [ ] Implement charts section (Net Cashflow, Revenue/Expenses, P&L)
- [ ] Add event timeline display in presenter mode
- [ ] Add assumptions panel (collapsible)
- [ ] Implement footer bar (disclaimer, export, back button)
- [ ] Apply Beacon & Ledger design system (Navy #15213C, Aqua #53E9C5, etc.)
- [ ] Add Framer Motion animations
- [ ] Ensure responsive design

### Phase 2.6: Enhanced Excel Export
- [ ] Update Excel export to include all new calculations
- [ ] Add VAT formulas (respecting vat_basis)
- [ ] Add CT formulas with proper timing
- [ ] Add PAYE/NIC formulas
- [ ] Add Dividend formulas with cash constraints
- [ ] Add working capital formulas (if accrual)
- [ ] Create multi-sheet workbook (Profile, Assumptions, Forecast, Summary)
- [ ] Ensure all formulas are correct and working

### Phase 2.7: Enhanced AI Recommendations
- [ ] Update `/api/ai/recommendations` endpoint
- [ ] Enhance prompts to consider entity type, accounting basis, tax settings
- [ ] Return structured suggestions per spec
- [ ] Update UI to display enhanced recommendations
- [ ] Add "Add to model" functionality

### Phase 2.8: Internal-Only Access Control
- [ ] Add environment variable for internal-only mode
- [ ] Disable public signup routes
- [ ] Add authentication check to API routes
- [ ] Implement simple access control

### Phase 2.9: Testing & Validation
- [ ] Unit tests for all new calculation engines
- [ ] Integration tests for full forecast with all features
- [ ] Test Excel export formulas
- [ ] Test presenter mode interactions
- [ ] Add error boundaries for forecast engine and LLM calls

### Phase 2.10: Documentation
- [ ] Update README with new features
- [ ] Document all settings and their effects
- [ ] Document event tree usage
- [ ] Document presenter mode
- [ ] Add JSDoc comments to forecast engine

## Requirements Traceability

All implementation tasks above map to requirements in `spec.md`:
- **BR-1 to BR-7** → Business Requirements
- **FR-1.1 to FR-10.1** → Functional Requirements
- **NFR-1 to NFR-6** → Non-Functional Requirements

See `spec.md` for complete requirements documentation.

## Environment Setup Required

Users need to configure:
- `NEXT_PUBLIC_INSTANT_APP_ID` - from InstantDB dashboard
- `INSTANT_ADMIN_TOKEN` - from InstantDB admin section
- `OPENAI_API_KEY` - from OpenAI dashboard
- `OPENAI_MODEL` - (optional) defaults to "gpt-3.5-turbo"

The app gracefully falls back to mock data when credentials are missing.

