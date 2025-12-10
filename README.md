## Cashflow Builder

Advanced interactive FP&A workspace designed as a guided journey:

1. **Create business profile** – AI-assisted intake with collaboration notes and business settings.
2. **Build cashflow** – Spreadsheet-style grid, charts, AI recommendations, and event tree system.
3. **Review & export** – Presenter mode for client meetings, invite collaborators, and download Excel with full formulas.

### Key Features

- **Multi-Basis Accounting**: Support for both Accrual and Cash basis accounting
- **Tax Calculations**: VAT (Accrual/Cash basis), Corporation Tax, PAYE/NIC, Dividends
- **Working Capital**: Debtor and creditor days adjustments for accrual basis
- **Event Tree System**: Model funding rounds, hires, client wins, and price increases
- **Multi-Year Forecasting**: 1, 3, 5, and 10-year forecast horizons
- **Presenter Mode**: Professional presentation view for client meetings
- **Enhanced Excel Export**: Multi-sheet workbook with full formulas for all calculations
- **AI Recommendations**: Intelligent suggestions for revenue/expense items and tax optimizations
- **AI Agent**: Conversational agent that guides users through business profile creation with intelligent questions

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Zustand for UI state, TanStack Query for data fetching
- InstantDB for persistence (profiles, scenarios, recommendations)
- OpenAI SDK for profile drafts + recommendation text
- ExcelJS for spreadsheet exports

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The primary routes:

- `/` – overview of the build
- `/agent` – AI-powered conversational agent for profile creation
- `/profile/new` – multi-step AI-assisted intake
- `/dashboard/[profileId]` – interactive cashflow workspace (defaults to `profile-demo`)

## Environment variables

Create `.env.local` with:

```
NEXT_PUBLIC_INSTANT_APP_ID=<your-instant-app-id>
INSTANT_ADMIN_TOKEN=<your-instant-admin-token>
OPENAI_API_KEY=<gpt-key>
OPENAI_MODEL=<model-name>  # Optional: defaults to gpt-3.5-turbo
INTERNAL_ONLY_MODE=false  # Optional: set to "true" for internal-only access (blocks public routes)
INTERNAL_API_KEY=<your-api-key>  # Optional: API key for internal access (required if INTERNAL_ONLY_MODE=true)
```

**Note:** 
- `NEXT_PUBLIC_INSTANT_APP_ID` is your public app identifier (safe to expose in client code)
- `INSTANT_ADMIN_TOKEN` is your secret admin token for server-side operations (keep private)
- `OPENAI_MODEL` is optional - if your project doesn't have access to `gpt-4o-mini`, set this to a model you have access to (e.g., `gpt-3.5-turbo`, `gpt-4`, etc.)

Without these, the app will fall back to mock data (still usable for demos).

## Scripts

| Command             | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Start local dev server                                |
| `npm run build`     | Production build                                      |
| `npm run lint`      | ESLint check                                          |
| `npm run test`      | Vitest unit tests for calculations + prompts          |

## AI Agent

The AI Agent is a conversational assistant that guides users through creating a complete business profile and cashflow forecast. It acts as an experienced accountant, finance director, and cashflow specialist.

### Features

- **Conversational Interface**: Natural dialogue with the AI agent
- **Intelligent Questioning**: Asks targeted follow-up questions to fill gaps
- **Progressive Profile Building**: Builds business profile incrementally as you provide information
- **Professional Insights**: Provides advisor-grade commentary, risks, and recommendations
- **Complete Integration**: Generates full profiles ready for forecasting

### How It Works

1. **Initialization**: Agent greets you with a startup message
2. **Information Gathering**: You provide business information (what it does, how it earns money, legal structure)
3. **Profile Building**: Agent creates/updates business profile with your information
4. **Question Asking**: Agent asks targeted follow-up questions for missing essential information
5. **Assumptions Building**: Agent generates complete cashflow assumptions
6. **Finalization**: Agent produces complete profile + assumptions with professional commentary
7. **Forecast Generation**: One-click generation of full cashflow forecast

### Agent Capabilities

The agent understands and prepares inputs for:
- **Accounting Basis**: Accrual vs Cash basis with working capital adjustments
- **VAT Logic**: VAT calculations on accrual or cash basis with quarterly timing
- **Corporation Tax**: Year-end calculations with 9-month payment timing
- **PAYE/NIC**: Monthly payroll obligations
- **Dividends**: Post-tax profit calculations with cash constraints
- **Working Capital**: Debtor and creditor days adjustments
- **Event Tree**: Funding, hiring, client wins, and pricing events

### Usage

Visit `/agent` to start a conversation. The agent will:
- Ask about your business model, revenue streams, and costs
- Determine appropriate tax settings based on entity type
- Suggest working capital settings for accrual basis
- Identify risks and opportunities
- Generate complete business profile and cashflow assumptions

Once complete, click "Generate Forecast" to create your cashflow forecast and be redirected to the dashboard.

## AI Recommendations

The AI recommendation system provides intelligent suggestions based on business context:

### Structured Output
The system returns structured recommendations per PRD spec:
- `suggested_revenue_items`: Array of revenue items with monthly values and explanations
- `suggested_expense_items`: Array of expense items (COGS/OPEX) with monthly values and explanations
- `suggested_working_capital`: Recommended debtor/creditor days with explanations
- `suggested_tax_switches`: Recommended tax setting changes with explanations
- `missing_cost_categories`: List of missing cost categories
- `missing_revenue_categories`: List of missing revenue categories

### Recommendation Sources
- **profile**: Based on business profile analysis
- **line-item**: Specific line item suggestions
- **insight**: General forecasting insights
- **tax-optimization**: Tax setting recommendations
- **working-capital**: Working capital optimization suggestions

### Usage
Recommendations are automatically generated when viewing the dashboard. Click "Add to Model" on any recommendation to automatically add suggested line items to your forecast.

## Testing

Tests live in `tests/`:

- `cashflow-calculations.test.ts` – verifies ARR/burn/runway math
- `enhanced-calculations.test.ts` – unit tests for enhanced forecast engine (accounting basis, VAT, CT, PAYE/NIC, dividends, working capital, events)
- `integration.test.ts` – integration tests for full forecast with all features enabled, settings validation
- `ai-prompts.test.ts` – ensures prompt templates embed context correctly

Run with `npm run test`.

**Note**: Additional unit tests for individual calculation engines (VAT, CT, PAYE/NIC, Dividends, Working Capital) are planned for future updates.

## InstantDB Setup

This app uses InstantDB for real-time data persistence. The schema is defined in `src/lib/instantdb/schema.ts`.

### Schema Tables

- `business_profiles` – business metadata + AI raw JSON + collaboration notes + business settings (entity type, accounting basis, VAT, tax toggles, working capital)
- `cashflow_scenarios` – per-profile modeling assumptions with horizon settings
- `line_items` – revenue/expense rows with monthly values (supports 1y, 3y, 5y, 10y horizons)
- `ai_recommendations` – generated insights + acceptance state
- `events` – event tree system (funding, hires, client wins, price increases)

### Getting Your Credentials

1. Sign up at [instantdb.com](https://www.instantdb.com)
2. Create a new app in the dashboard
3. Copy your `App ID` (use as `NEXT_PUBLIC_INSTANT_APP_ID`)
4. Generate an `Admin Token` from the backend/admin section (use as `INSTANT_ADMIN_TOKEN`)

### Data Access

- Client-side: Uses `@instantdb/react` hooks for real-time subscriptions
- Server-side: Uses `@instantdb/admin` SDK for API routes and server actions
- Access control: Rows are scoped by `owner_id` for multi-tenant support

### Fallback Behavior

If InstantDB credentials are missing, the app automatically falls back to mock data, allowing you to develop and test the UI without a database connection.

## Phase 2 Features (Complete)

All Phase 2 features from the PRD are now implemented:

✅ **Enhanced Forecast Engine**: Full support for accrual/cash basis with working capital adjustments  
✅ **Tax Calculations**: VAT (accrual/cash basis), Corporation Tax (9-month payment timing), PAYE/NIC, Dividends  
✅ **Event Tree System**: Complete CRUD operations with proper event application to forecasts  
✅ **Presenter Mode**: Full implementation with metrics, charts, event timeline, and assumptions panel  
✅ **Enhanced Excel Export**: Multi-sheet workbook with formulas for all calculations  
✅ **Enhanced AI Recommendations**: Structured suggestions per PRD spec  
✅ **Internal-Only Access Control**: Middleware-based authentication for restricted access  
✅ **Comprehensive Documentation**: JSDoc comments and updated README

## Business Settings

The application supports comprehensive business settings that affect forecast calculations:

### Entity Type
- **Limited Company**: Supports Corporation Tax and Dividends
- **Sole Trader**: Corporation Tax and Dividends are automatically disabled

### Accounting Basis
- **Accrual Basis**: 
  - Revenue and expenses recognized when incurred
  - Working capital adjustments (debtor/creditor days) applied
  - VAT can be calculated on accrual or cash basis
- **Cash Basis**:
  - Revenue recognized when cash received
  - Expenses recognized when cash paid
  - No working capital adjustments (debtor/creditor days set to 0)

### VAT Configuration
- **Enable/Disable**: Toggle VAT calculations on/off
- **VAT Basis**: 
  - **Accrual**: VAT calculated on invoiced amounts
  - **Cash**: VAT calculated on cash received/paid
- **VAT Rate**: 20% (UK standard rate)
- **Payment Timing**: Quarterly (every 3 months)

### Tax Settings
- **Corporation Tax**: 
  - Only available for Limited Companies
  - Calculated on taxable profit (accrual basis)
  - Payment timing: 9 months after year-end
- **PAYE/NIC**: 
  - Monthly employer NIC calculations
  - Monthly PAYE as cash outflow
- **Dividends**: 
  - Only available for Limited Companies
  - Calculated from post-tax profit
  - Payout ratio configurable (0-100%)
  - Constrained by available cash

### Working Capital
- **Debtor Days**: Average days to receive payment from customers (Accrual basis only)
- **Creditor Days**: Average days to pay suppliers (Accrual basis only)
- Automatically set to 0 for Cash basis

## Event Tree System

The Event Tree allows you to model significant business events that affect the forecast:

### Event Types
- **Funding**: One-off cash injection at specified month
- **Hire**: Recurring expense increase from event month forward
- **Client Win**: Recurring revenue increase from event month forward
- **Price Increase**: Percentage uplift to revenue from event month forward

### Event Application
Events are applied in order and are cumulative. The forecast automatically recalculates when events are added, modified, or deleted.

## Presenter Mode

Presenter Mode provides a clean, read-only view optimized for client presentations:

### Features
- **Header Bar**: Business name, entity type, accounting basis, forecast horizon selector, tax module status
- **Metric Cards**: Net cash position, peak negative cash, break-even month, cash runway, revenue growth
- **Charts**: 
  - Net cashflow line chart with negative zone highlighting
  - Revenue & expenses stacked bar chart
- **Event Timeline**: Visual timeline showing all events across the forecast period
- **Assumptions Panel**: Collapsible accordion with tax rates, working capital settings, and key assumptions
- **Export**: Direct Excel export from presenter mode

### Usage
Click "Presenter Mode" button in the dashboard to enter presenter mode. Use the horizon selector (1Y / 3Y / 5Y / 10Y) to switch between forecast periods.

## Excel Export

The Excel export creates a comprehensive multi-sheet workbook with full formula support:

### Sheets
1. **Profile**: Business details and metadata
2. **Assumptions**: All business settings (entity type, accounting basis, tax toggles, working capital)
3. **Forecast**: Monthly forecast data with all calculations and formulas
4. **Summary**: Key metrics and summary statistics

### Formulas
All calculations include full Excel formulas that update automatically:

**Revenue & Expenses:**
- Total Revenue: `=SUM(B2:Bx)` (sums all revenue line items)
- Total Expenses: `=SUM(Bx:By)` (sums all COGS and OPEX line items)

**VAT (if enabled):**
- VAT Collected: `=Revenue*0.2` (for accrual basis) or calculated values (for cash basis)
- VAT Paid: Calculated values based on expenses
- VAT Payable: Quarterly formula `=SUM(VAT_Collected_Quarter)-SUM(VAT_Paid_Quarter)`

**Corporation Tax (if enabled):**
- Year-end calculation: `=IF(AnnualProfit>0,AnnualProfit*0.19,0)`
- Payment timing: References year-end calculation 9 months later

**PAYE/NIC (if enabled):**
- Monthly formula: `=Expenses*0.2*0.138` (20% payroll ratio × 13.8% employer NIC)

**Dividends (if enabled):**
- Calculated values with cash constraints (formulas would be too complex, uses pre-calculated values)

**Working Capital (Accrual basis only):**
- Accounts Receivable: Monthly AR balance
- Accounts Payable: Monthly AP balance

**Cash Balance:**
- Month 1: Opening balance
- Subsequent months: `=PreviousBalance + NetCashflow`

## Error Handling

The application includes comprehensive error handling:

- **Error Boundaries**: React error boundaries catch JavaScript errors and display fallback UI
- **API Error Handling**: Graceful degradation with mock data when external services are unavailable
- **Validation**: Real-time validation feedback in forms
- **User Feedback**: Success and error messages for all user actions

## Internal-Only Access Control

When `INTERNAL_ONLY_MODE=true`, the application restricts access to authorized users only:

- **Middleware Protection**: All routes (except static assets and API routes) are protected
- **API Key Authentication**: Valid API key required in `x-api-key` header or `internal_api_key` cookie
- **403 Response**: Unauthorized requests receive a 403 Forbidden response
- **API Routes**: API routes handle their own authentication (can implement additional checks)

**Usage:**
1. Set `INTERNAL_ONLY_MODE=true` in `.env.local`
2. Set `INTERNAL_API_KEY=<your-secret-key>` in `.env.local`
3. Include `x-api-key: <your-secret-key>` header in requests, or set `internal_api_key` cookie

## Performance

- Forecast recalculation is optimized for large datasets (up to 10-year horizons)
- Automatic recalculation triggers when settings, events, or line items change
- React Query caching for efficient data fetching
- Lazy loading and code splitting for optimal bundle size
- Enhanced calculations complete in < 2 seconds for 10-year forecasts
