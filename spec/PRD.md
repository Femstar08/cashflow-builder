# Product Requirements Document (PRD)
## Beacon & Ledger Cashflow Builder

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Draft - Awaiting Approval  
**Author:** Development Team

---

## 1. Executive Summary

### 1.1 Purpose
The Beacon & Ledger Cashflow Builder is an interactive, AI-assisted financial forecasting tool designed for accountants and their clients to collaboratively build comprehensive cashflow projections. The system supports multiple accounting bases, tax calculations, working capital management, and event-based scenario modeling.

### 1.2 Objectives
- Enable collaborative cashflow building between accountants and clients
- Support multiple accounting methodologies (Cash/Accrual basis)
- Provide comprehensive tax calculations (VAT, Corporation Tax, PAYE/NIC, Dividends)
- Enable scenario modeling through event trees
- Deliver professional presentation-ready outputs
- Export to Excel with full formula support

### 1.3 Success Criteria
- Users can create accurate multi-year forecasts (1/3/5/10 years)
- All tax calculations are correct and compliant
- Excel exports maintain formula integrity
- Presenter Mode enables professional client presentations
- AI recommendations improve forecast completeness
- System handles edge cases gracefully

---

## 2. Stakeholders

| Stakeholder | Role | Key Needs |
|------------|------|-----------|
| Accountants | Primary User | Collaborative tools, professional presentation, accurate calculations |
| Clients | Secondary User | Simple interface, clear visualizations, export capabilities |
| Beacon & Ledger | Business Owner | Internal-only access, brand consistency, production-ready quality |

---

## 3. User Personas

### 3.1 Primary Persona: Accountant (Sarah)
- **Role:** Financial advisor/accountant
- **Goals:** Create accurate forecasts, present to clients, collaborate with clients
- **Pain Points:** Complex spreadsheets, manual calculations, version control
- **Tech Comfort:** High

### 3.2 Secondary Persona: Client (Michael)
- **Role:** Business owner
- **Goals:** Understand cashflow, make informed decisions, provide business context
- **Pain Points:** Financial complexity, lack of visibility
- **Tech Comfort:** Medium

---

## 4. Functional Requirements

### 4.1 Business Profile Management

#### FR-1.1: Profile Creation
**Priority:** High  
**Description:** Users must be able to create business profiles with comprehensive business information.

**Requirements:**
- Capture business name, URL, industry, description, headquarters
- Support entity type selection (Limited Company / Sole Trader)
- Allow free-form collaboration notes
- AI-assisted profile generation from URL or text input
- Store profile in InstantDB

**Acceptance Criteria:**
- Profile can be created with all required fields
- AI generates reasonable defaults when URL/text provided
- Profile persists correctly
- Notes field supports multi-line text

---

#### FR-1.2: Business Settings Configuration
**Priority:** High  
**Description:** Users must configure accounting and tax settings that drive forecast calculations.

**Requirements:**
- Entity type selector (Limited Company / Sole Trader)
- Accounting basis toggle (Accrual / Cash)
- VAT enable toggle with basis selector (Accrual / Cash / Off)
- Corporation Tax toggle (Limited Company only)
- PAYE/NIC toggle
- Dividends toggle with director salary and payout ratio (Limited Company only)
- Working capital inputs: debtor days, creditor days (Accrual only)

**Validation Rules:**
- If entity_type = "sole_trader": CT and dividends automatically disabled
- If accounting_basis = "cash": debtor_days and creditor_days set to 0
- If vat_enabled = false: vat_basis ignored
- All settings persist to InstantDB

**Acceptance Criteria:**
- Settings UI reflects all options
- Validation prevents invalid combinations
- Settings save correctly
- Changes trigger forecast recalculation

---

### 4.2 Forecast Engine

#### FR-2.1: Accounting Basis Calculations
**Priority:** High  
**Description:** System must calculate forecasts differently based on accounting basis.

**Accrual Basis:**
- Revenue recognized when invoiced
- Expenses recognized when incurred
- Apply debtor_days for revenue timing
- Apply creditor_days for expense timing
- Calculate AR/AP working capital adjustments
- Monthly cashflow reflects timing differences

**Cash Basis:**
- Revenue recognized when cash received
- Expenses recognized when cash paid
- No working capital adjustments
- debtor_days = 0, creditor_days = 0
- Direct cash timing

**Acceptance Criteria:**
- Accrual forecasts show AR/AP timing
- Cash forecasts show immediate cash impact
- Switching basis recalculates correctly
- Working capital only applies in accrual mode

---

#### FR-2.2: VAT Calculations
**Priority:** High  
**Description:** System must calculate VAT based on enabled status and basis.

**If vat_enabled = false:**
- No VAT calculations
- No VAT line items
- Revenue/expenses shown net

**If vat_enabled = true AND vat_basis = "accrual":**
- VAT on invoiced sales
- VAT on invoiced expenses
- VAT payable calculated quarterly
- VAT timing based on invoice dates

**If vat_enabled = true AND vat_basis = "cash":**
- VAT on cash received
- VAT on cash paid
- VAT payable calculated quarterly
- VAT timing based on cash dates

**Acceptance Criteria:**
- VAT calculations are accurate
- VAT basis aligns with accounting basis when cash
- VAT quarters calculated correctly
- VAT line items appear/disappear based on toggle

---

#### FR-2.3: Corporation Tax Calculations
**Priority:** High  
**Description:** System must calculate CT for Limited Companies when enabled.

**Requirements:**
- Only applies if entity_type = "limited_company" AND include_corporation_tax = true
- Calculate CT on taxable profit (accrual basis)
- CT rate: 19% (or configurable)
- Payment timing: Month 21 for Year 1 (9 months after year-end)
- For multi-year: apply annually with correct timing
- Add CT as cash outflow line item

**Acceptance Criteria:**
- CT only appears for Limited Companies
- CT timing is correct (9 months after year-end)
- Multi-year forecasts handle CT correctly
- CT calculations are accurate

---

#### FR-2.4: PAYE/NIC Calculations
**Priority:** Medium  
**Description:** System must calculate PAYE and NIC when enabled.

**Requirements:**
- Only if include_paye_nic = true
- Calculate monthly employer NIC
- Calculate monthly PAYE
- Apply cash timing rules (not accrual)
- Add as monthly cash outflows

**Acceptance Criteria:**
- PAYE/NIC appear as line items when enabled
- Calculations follow cash timing
- Monthly amounts are correct

---

#### FR-2.5: Dividend Calculations
**Priority:** Medium  
**Description:** System must model dividend payouts for Limited Companies.

**Requirements:**
- Only if entity_type = "limited_company" AND include_dividends = true
- Inputs: director_salary, dividend_payout_ratio (0-1)
- Calculate post-tax profit
- Apply payout_ratio to post-tax profit
- Constraint: dividends cannot exceed available cash
- Add dividends as cash outflow
- Handle multi-year calculations

**Acceptance Criteria:**
- Dividends only for Limited Companies
- Payout ratio applied correctly
- Cash constraint enforced
- Multi-year dividends calculated properly

---

#### FR-2.6: Working Capital Adjustments
**Priority:** High  
**Description:** System must apply debtor/creditor days for accrual basis forecasts.

**Requirements:**
- Only apply if accounting_basis = "accrual"
- Debtor Days: Shift revenue forward based on payment terms
- Creditor Days: Shift expenses forward based on payment terms
- Calculate AR/AP balances monthly
- Update cashflow with working capital adjustments
- If cash basis: automatically set to 0

**Acceptance Criteria:**
- Working capital only in accrual mode
- Debtor days shift revenue correctly
- Creditor days shift expenses correctly
- AR/AP balances calculated accurately

---

### 4.3 Event Tree System

#### FR-3.1: Event Management
**Priority:** High  
**Description:** Users must be able to create and manage forecast events.

**Event Types:**
- **Funding:** One-off cash injection at specified month
- **Hire:** Increase payroll/staff costs from event month forward
- **Client Win:** Add recurring revenue from event month forward
- **Price Increase:** Apply percentage uplift from event month forward

**Event Properties:**
- id: uuid
- event_name: string
- event_month: number (1-120)
- event_type: "funding" | "hire" | "client_win" | "price_increase"
- amount: number (for funding, hire cost)
- percent_change: number (for price increase)
- target: string (e.g., "revenue", "staff_costs")

**Acceptance Criteria:**
- Events can be created with all properties
- Events persist to InstantDB
- Events can be edited and deleted
- Event timeline displays correctly

---

#### FR-3.2: Event Application
**Priority:** High  
**Description:** System must apply events to forecasts in correct order.

**Application Order:**
1. Funding events → one-off cash injection
2. Hire events → increase payroll from event month forward
3. Client win → add recurring revenue from event month forward
4. Price increase → apply % uplift from event month forward

**Requirements:**
- Events are cumulative
- Events re-apply on every recalculation
- Events respect forecast horizon
- Event impacts visible in charts

**Acceptance Criteria:**
- Events apply in correct order
- Funding adds cash correctly
- Hires increase costs from event month
- Client wins add revenue from event month
- Price increases apply % correctly

---

### 4.4 Multi-Year Forecasting

#### FR-4.1: Horizon Selection
**Priority:** High  
**Description:** Users must be able to select forecast horizon.

**Options:**
- 1 Year (12 months)
- 3 Years (36 months)
- 5 Years (60 months)
- 10 Years (120 months)

**Requirements:**
- Horizon selector in UI
- Forecast recalculates when horizon changes
- All calculations respect horizon
- CT calculations handle year-end boundaries
- Charts scale to horizon

**Acceptance Criteria:**
- All horizons work correctly
- Switching horizon recalculates
- Year-end boundaries handled correctly
- Charts display full horizon

---

### 4.5 Presenter Mode

#### FR-5.1: Presenter Mode UI
**Priority:** High  
**Description:** Clean, read-only view for client presentations.

**Layout Components:**
- Header Bar: Business info, entity type, accounting basis, horizon selector, tax status, exit button
- Metric Cards: Net cash position, peak negative, break-even month, cash runway, revenue growth
- Charts: Net cashflow line, revenue/expenses stacked bar, P&L summary
- Event Timeline: Visual timeline with event cards
- Assumptions Panel: Tax rates, working capital, growth rates
- Footer: Disclaimer, last updated, export button, back to dashboard

**Design Requirements:**
- Beacon & Ledger brand colors (Navy #15213C, Aqua #53E9C5, Slate #5C6478)
- Full-screen capable
- Responsive design
- Print-friendly
- No edit controls visible

**Acceptance Criteria:**
- Presenter mode hides all edit controls
- All metrics display correctly
- Charts render properly
- Full-screen works
- Export button functions

---

### 4.6 Excel Export

#### FR-6.1: Multi-Sheet Workbook
**Priority:** High  
**Description:** Export must create comprehensive Excel workbook.

**Sheets Required:**
1. **Profile:** Business details and settings
2. **Assumptions:** All configuration settings
3. **Forecast:** Monthly data with formulas
4. **Summary:** Key metrics and charts data

**Acceptance Criteria:**
- All sheets created
- Data populates correctly
- Formulas work in Excel
- Formatting is professional

---

#### FR-6.2: Formula Implementation
**Priority:** High  
**Description:** Excel must contain working formulas.

**Required Formulas:**
- Monthly totals: `=SUM(Bx:My)`
- Cash balance: `Balance_M1 = OpeningBalance + NetCash_M1`, `Balance_M2 = Balance_M1 + NetCash_M2`, etc.
- VAT formulas respecting vat_basis
- CT formulas with proper timing
- Dividend formulas with cash constraints
- Working capital formulas (if accrual)

**Acceptance Criteria:**
- All formulas work in Excel
- Formulas update when data changes
- Conditional rows handled correctly
- Formula references are correct

---

### 4.7 AI Recommendations

#### FR-7.1: Enhanced AI Recommendations
**Priority:** Medium  
**Description:** AI must provide contextual recommendations.

**Input:**
- business_profile
- current_revenue_items
- current_expense_items
- working_capital settings
- tax toggles

**Output:**
```json
{
  suggested_revenue_items: [...],
  suggested_expense_items: [...],
  suggested_working_capital: {...},
  suggested_tax_switches: {...},
  missing_cost_categories: [...],
  missing_revenue_categories: [...]
}
```

**UI Requirements:**
- Display suggestions with explanations
- "Add to model" buttons
- Group by category
- Show confidence indicators

**Acceptance Criteria:**
- Recommendations are relevant
- Suggestions can be added to model
- Explanations are clear
- AI considers all settings

---

### 4.8 Access Control

#### FR-8.1: Internal-Only Mode
**Priority:** Medium  
**Description:** System must restrict access to internal users only.

**Requirements:**
- No public signup
- No user-facing authentication UI
- Routes secured behind internal flag
- Admin-only access via environment variable
- Disable registration pages

**Acceptance Criteria:**
- Public routes are blocked
- Only authorized users can access
- Environment variable controls access
- No registration UI visible

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Forecast recalculation completes in < 2 seconds for 10-year horizon
- Page load time < 3 seconds
- Charts render smoothly without lag
- Excel export completes in < 5 seconds

### 5.2 Usability
- Intuitive navigation (guided journey)
- Clear error messages
- Helpful tooltips
- Responsive design (mobile, tablet, desktop)

### 5.3 Reliability
- Graceful error handling
- Fallback to mock data when APIs fail
- Data validation prevents invalid states
- Error boundaries for critical components

### 5.4 Security
- Environment variables for sensitive data
- No API keys exposed to client
- Input validation and sanitization
- Secure data storage in InstantDB

### 5.5 Maintainability
- Clean code structure
- Comprehensive documentation
- Unit tests for calculations
- Integration tests for workflows

---

## 6. Technical Constraints

### 6.1 Technology Stack
- Frontend: Next.js 16 (App Router), React 19, TypeScript
- Styling: Tailwind CSS
- State: Zustand, TanStack Query
- Database: InstantDB (no Supabase)
- Charts: Recharts
- Excel: ExcelJS
- AI: OpenAI API

### 6.2 Data Storage
- InstantDB for all persistent data
- No Supabase dependencies
- Schema defined in `src/lib/instantdb/schema.ts`

### 6.3 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Latest 2 versions

---

## 7. Assumptions and Dependencies

### 7.1 Assumptions
- Users have basic financial knowledge
- Internet connection required
- InstantDB credentials available
- OpenAI API key available (optional, falls back to mock)

### 7.2 Dependencies
- InstantDB service availability
- OpenAI API availability (optional)
- Node.js 18+ for development

---

## 8. Out of Scope

- Real-time collaboration (sequential only)
- Mobile native apps
- Multi-currency support (v1)
- Advanced scenario modeling beyond event tree
- Integration with accounting software (v1)
- User authentication system (internal-only mode)

---

## 9. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex tax calculations incorrect | High | Medium | Comprehensive testing, peer review |
| Performance issues with large forecasts | Medium | Low | Optimization, pagination if needed |
| InstantDB API changes | Medium | Low | Abstraction layer, fallback to mock |
| OpenAI API failures | Low | Medium | Graceful fallback to mock data |

---

## 10. Success Metrics

- Forecast accuracy (user feedback)
- Time to create forecast (target: < 15 minutes)
- Excel export usage rate
- Presenter Mode usage rate
- AI recommendation acceptance rate
- User satisfaction score

---

## 11. Approval

**Status:** Awaiting Approval

**Approved By:**
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Design Lead
- [ ] Stakeholder

**Date:** ___________

---

## 12. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | Dev Team | Initial PRD creation |

---

## 13. Traceability

This PRD will be traced to:
- Design documents
- User stories
- Test cases
- Implementation tasks

