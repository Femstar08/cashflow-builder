# User Stories and Tasks
## Beacon & Ledger Cashflow Builder

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Ready for Implementation  
**Based on:** PRD.md v1.0, DESIGN_DOCUMENT.md v1.0

---

## User Story Format

Each user story follows the format:
- **As a** [user type]
- **I want to** [action/goal]
- **So that** [benefit/value]
- **Acceptance Criteria:** [specific conditions]
- **Traceability:** [PRD requirement reference]

---

## User Journey: Creating a Business Profile

### US-1.1: Access the Application
**As a** user (accountant or client)  
**I want to** access the cashflow builder application  
**So that** I can start creating forecasts

**Acceptance Criteria:**
- Homepage loads successfully
- Navigation is clear and intuitive
- I can see the guided journey steps
- I can access existing profiles if any exist

**Traceability:** PRD Section 4.1, Design Section 2.1

**Tasks:**
- [ ] T-1.1.1: Implement homepage layout with hero section
- [ ] T-1.1.2: Implement journey steps visualization
- [ ] T-1.1.3: Add navigation to existing profiles
- [ ] T-1.1.4: Ensure responsive design for all devices

---

### US-1.2: Create a New Business Profile
**As a** user  
**I want to** create a new business profile  
**So that** I can start building a cashflow forecast

**Acceptance Criteria:**
- I can click "Create Profile" button
- Profile intake form opens
- I can navigate through all steps
- Progress indicator shows my current step

**Traceability:** PRD FR-1.1, Design Section 2.2

**Tasks:**
- [ ] T-1.2.1: Create profile intake form component
- [ ] T-1.2.2: Implement multi-step form navigation
- [ ] T-1.2.3: Add progress indicator component
- [ ] T-1.2.4: Implement form state management
- [ ] T-1.2.5: Add form validation

---

### US-1.3: Enter Business Basic Information
**As a** user  
**I want to** enter basic business information  
**So that** the system can identify the business

**Acceptance Criteria:**
- I can enter business name (required)
- I can enter business URL (optional, validated)
- I can select industry from dropdown
- I can use AI to generate profile from URL
- Form validates required fields

**Traceability:** PRD FR-1.1, Design Section 2.2 Step 1

**Tasks:**
- [ ] T-1.3.1: Create business basics form fields
- [ ] T-1.3.2: Implement industry dropdown with options
- [ ] T-1.3.3: Add URL validation
- [ ] T-1.3.4: Integrate AI profile generation
- [ ] T-1.3.5: Add field validation and error messages

---

### US-1.4: Enter Business Details
**As a** user  
**I want to** provide detailed business information  
**So that** the forecast can be more accurate

**Acceptance Criteria:**
- I can enter business description
- I can enter headquarters location
- I can add additional notes
- All fields are optional but helpful

**Traceability:** PRD FR-1.1, Design Section 2.2 Step 2

**Tasks:**
- [ ] T-1.4.1: Create business details form fields
- [ ] T-1.4.2: Implement textarea components
- [ ] T-1.4.3: Add character count indicators (optional)
- [ ] T-1.4.4: Save draft automatically

---

### US-1.5: Configure Business Settings
**As a** user  
**I want to** configure accounting and tax settings  
**So that** the forecast uses the correct calculation methods

**Acceptance Criteria:**
- I can select entity type (Limited Company / Sole Trader)
- I can select accounting basis (Accrual / Cash)
- I can enable/disable VAT and set VAT basis
- I can toggle tax options (CT, PAYE/NIC, Dividends)
- I can set working capital days (if accrual)
- I can set dividend settings (if dividends enabled)
- Settings validate correctly (e.g., CT disabled for Sole Trader)

**Traceability:** PRD FR-1.2, Design Section 2.2 Step 3, 2.4

**Tasks:**
- [ ] T-1.5.1: Create entity type selector (radio buttons)
- [ ] T-1.5.2: Create accounting basis toggle
- [ ] T-1.5.3: Create VAT section with enable toggle and basis selector
- [ ] T-1.5.4: Create tax toggles (CT, PAYE/NIC, Dividends)
- [ ] T-1.5.5: Create working capital inputs (debtor/creditor days)
- [ ] T-1.5.6: Create dividend settings inputs
- [ ] T-1.5.7: Implement conditional field visibility logic
- [ ] T-1.5.8: Implement validation rules
- [ ] T-1.5.9: Add help text and tooltips

---

### US-1.6: Add Collaboration Notes
**As a** user  
**I want to** add free-form notes to the profile  
**So that** I can collaborate with others and add context

**Acceptance Criteria:**
- I can enter multi-line notes
- Notes are saved with the profile
- Notes are visible in the dashboard
- Notes support markdown or plain text

**Traceability:** PRD FR-1.1, Design Section 2.2 Step 4

**Tasks:**
- [ ] T-1.6.1: Create notes textarea field
- [ ] T-1.6.2: Implement notes persistence
- [ ] T-1.6.3: Display notes in profile view
- [ ] T-1.6.4: Add notes editing capability

---

### US-1.7: Save Business Profile
**As a** user  
**I want to** save my business profile  
**So that** I can access it later and build forecasts

**Acceptance Criteria:**
- Profile saves to InstantDB
- I receive confirmation of successful save
- I am redirected to dashboard or profile list
- Profile appears in my profiles list
- I can edit the profile later

**Traceability:** PRD FR-1.1, Design Section 2.2

**Tasks:**
- [ ] T-1.7.1: Implement profile save server action
- [ ] T-1.7.2: Add InstantDB profile creation
- [ ] T-1.7.3: Add success notification
- [ ] T-1.7.4: Implement redirect after save
- [ ] T-1.7.5: Add error handling for save failures

---

## User Journey: Building a Cashflow Forecast

### US-2.1: Access Dashboard
**As a** user  
**I want to** access the dashboard for a business profile  
**So that** I can build and view cashflow forecasts

**Acceptance Criteria:**
- Dashboard loads with selected profile
- I can see current forecast data
- I can see key metrics
- Navigation is clear

**Traceability:** PRD Section 4.2, Design Section 2.3

**Tasks:**
- [ ] T-2.1.1: Create dashboard layout component
- [ ] T-2.1.2: Implement sidebar navigation
- [ ] T-2.1.3: Implement top navigation bar
- [ ] T-2.1.4: Load profile data on dashboard mount
- [ ] T-2.1.5: Display profile name and settings

---

### US-2.2: Select Forecast Horizon
**As a** user  
**I want to** select the forecast horizon (1/3/5/10 years)  
**So that** I can see projections for the desired time period

**Acceptance Criteria:**
- I can select from 1Y, 3Y, 5Y, 10Y options
- Forecast recalculates when horizon changes
- Charts update to show new horizon
- Grid displays correct number of months

**Traceability:** PRD FR-4.1, Design Section 2.3

**Tasks:**
- [ ] T-2.2.1: Create horizon selector toggle group
- [ ] T-2.2.2: Implement horizon state management
- [ ] T-2.2.3: Trigger forecast recalculation on change
- [ ] T-2.2.4: Update grid columns for new horizon
- [ ] T-2.2.5: Update charts for new horizon

---

### US-2.3: View Key Metrics
**As a** user  
**I want to** see key financial metrics  
**So that** I can quickly understand the forecast health

**Acceptance Criteria:**
- I can see ARR (Annual Recurring Revenue)
- I can see Gross Margin percentage
- I can see Monthly Burn rate
- I can see Cash Runway in months
- Metrics update when forecast changes

**Traceability:** PRD Section 4.2, Design Section 2.3

**Tasks:**
- [ ] T-2.3.1: Create metrics calculation functions
- [ ] T-2.3.2: Create metric card components
- [ ] T-2.3.3: Display metrics in dashboard
- [ ] T-2.3.4: Update metrics on forecast change
- [ ] T-2.3.5: Format numbers with currency/percent

---

### US-2.4: Add Revenue Line Items
**As a** user  
**I want to** add revenue line items to the forecast  
**So that** I can model income streams

**Acceptance Criteria:**
- I can add new revenue line items
- I can enter line item name
- I can enter monthly values for each month
- I can edit existing revenue items
- I can delete revenue items
- Changes save automatically

**Traceability:** PRD Section 4.2, Design Section 2.3

**Tasks:**
- [ ] T-2.4.1: Implement AG Grid for cashflow data
- [ ] T-2.4.2: Add "Add Line Item" functionality
- [ ] T-2.4.3: Implement inline editing in grid
- [ ] T-2.4.4: Implement line item deletion
- [ ] T-2.4.5: Auto-save changes to InstantDB
- [ ] T-2.4.6: Recalculate forecast on changes

---

### US-2.5: Add Expense Line Items
**As a** user  
**I want to** add expense line items to the forecast  
**So that** I can model costs and outgoings

**Acceptance Criteria:**
- I can add COGS (Cost of Goods Sold) items
- I can add OPEX (Operating Expenses) items
- I can enter monthly values for each month
- I can edit existing expense items
- I can delete expense items
- Changes save automatically

**Traceability:** PRD Section 4.2, Design Section 2.3

**Tasks:**
- [ ] T-2.5.1: Support expense line item types (COGS, OPEX)
- [ ] T-2.5.2: Add expense items to grid
- [ ] T-2.5.3: Implement expense editing
- [ ] T-2.5.4: Implement expense deletion
- [ ] T-2.5.5: Auto-save expense changes

---

### US-2.6: Edit Monthly Values in Grid
**As a** user  
**I want to** edit monthly values directly in the grid  
**So that** I can quickly adjust the forecast

**Acceptance Criteria:**
- I can click on any cell to edit
- I can type new values
- Changes are validated (numbers only)
- Changes save automatically
- Forecast recalculates on change

**Traceability:** PRD Section 4.2, Design Section 2.3

**Tasks:**
- [ ] T-2.6.1: Enable cell editing in AG Grid
- [ ] T-2.6.2: Implement number validation
- [ ] T-2.6.3: Implement auto-save on cell edit
- [ ] T-2.6.4: Trigger recalculation on edit
- [ ] T-2.6.5: Add visual feedback for edited cells

---

### US-2.7: View Calculated Totals
**As a** user  
**I want to** see calculated totals for revenue, expenses, and net cash  
**So that** I can verify the forecast is correct

**Acceptance Criteria:**
- I can see total revenue per month
- I can see total expenses per month
- I can see net cash per month
- Totals update automatically when values change
- Totals are clearly displayed in the grid

**Traceability:** PRD Section 4.2, Design Section 2.3

**Tasks:**
- [ ] T-2.7.1: Implement revenue total calculation
- [ ] T-2.7.2: Implement expense total calculation
- [ ] T-2.7.3: Implement net cash calculation
- [ ] T-2.7.4: Display totals in grid footer row
- [ ] T-2.7.5: Update totals on data change

---

## User Journey: Configuring Settings

### US-3.1: Edit Business Settings
**As a** user  
**I want to** edit business settings after profile creation  
**So that** I can adjust calculation methods

**Acceptance Criteria:**
- I can access settings from dashboard
- I can change entity type, accounting basis, tax settings
- Changes trigger forecast recalculation
- Settings save correctly
- Validation prevents invalid combinations

**Traceability:** PRD FR-1.2, Design Section 2.4

**Tasks:**
- [ ] T-3.1.1: Create settings panel/drawer component
- [ ] T-3.1.2: Load current settings into form
- [ ] T-3.1.3: Implement settings update
- [ ] T-3.1.4: Trigger forecast recalculation
- [ ] T-3.1.5: Add settings validation

---

### US-3.2: Toggle Accounting Basis
**As a** user  
**I want to** switch between accrual and cash accounting basis  
**So that** I can see forecasts in different accounting methods

**Acceptance Criteria:**
- I can toggle between Accrual and Cash
- Forecast recalculates with new basis
- Working capital fields disable/enable correctly
- Cash basis sets debtor/creditor days to 0
- Calculations reflect the selected basis

**Traceability:** PRD FR-2.1, Design Section 2.4

**Tasks:**
- [ ] T-3.2.1: Implement accounting basis toggle
- [ ] T-3.2.2: Update forecast engine for basis change
- [ ] T-3.2.3: Disable working capital for cash basis
- [ ] T-3.2.4: Recalculate with new basis
- [ ] T-3.2.5: Update UI to reflect basis

---

### US-3.3: Configure VAT Settings
**As a** user  
**I want to** enable/disable VAT and set VAT basis  
**So that** VAT calculations are included in the forecast

**Acceptance Criteria:**
- I can enable/disable VAT
- I can select VAT basis (Accrual/Cash) when enabled
- VAT basis is ignored when disabled
- VAT calculations appear/disappear correctly
- Forecast recalculates with VAT changes

**Traceability:** PRD FR-2.2, Design Section 2.4

**Tasks:**
- [ ] T-3.3.1: Implement VAT enable toggle
- [ ] T-3.3.2: Implement VAT basis selector
- [ ] T-3.3.3: Add VAT calculation logic
- [ ] T-3.3.4: Show/hide VAT line items
- [ ] T-3.3.5: Recalculate forecast with VAT

---

### US-3.4: Configure Tax Toggles
**As a** user  
**I want to** enable/disable Corporation Tax, PAYE/NIC, and Dividends  
**So that** tax calculations match the business structure

**Acceptance Criteria:**
- I can toggle Corporation Tax (Limited Company only)
- I can toggle PAYE/NIC
- I can toggle Dividends (Limited Company only)
- CT and Dividends disabled for Sole Trader
- Tax calculations appear/disappear correctly

**Traceability:** PRD FR-2.3, FR-2.4, FR-2.5, Design Section 2.4

**Tasks:**
- [ ] T-3.4.1: Implement CT toggle with entity type validation
- [ ] T-3.4.2: Implement PAYE/NIC toggle
- [ ] T-3.4.3: Implement Dividends toggle with entity type validation
- [ ] T-3.4.4: Add tax calculation logic
- [ ] T-3.4.5: Show/hide tax line items
- [ ] T-3.4.6: Recalculate forecast with tax changes

---

### US-3.5: Configure Working Capital
**As a** user  
**I want to** set debtor and creditor days  
**So that** working capital adjustments are applied correctly

**Acceptance Criteria:**
- I can set debtor days (0-365)
- I can set creditor days (0-365)
- Fields only enabled for Accrual basis
- Working capital calculations apply correctly
- Forecast shows AR/AP timing adjustments

**Traceability:** PRD FR-2.6, Design Section 2.4

**Tasks:**
- [ ] T-3.5.1: Create debtor days input field
- [ ] T-3.5.2: Create creditor days input field
- [ ] T-3.5.3: Disable fields for cash basis
- [ ] T-3.5.4: Implement working capital calculation logic
- [ ] T-3.5.5: Apply working capital to forecast
- [ ] T-3.5.6: Recalculate on days change

---

## User Journey: Managing Events

### US-4.1: View Event Timeline
**As a** user  
**I want to** see a visual timeline of forecast events  
**So that** I can understand when events occur

**Acceptance Criteria:**
- I can see events plotted on a timeline
- Events are color-coded by type
- I can see event details on hover
- Timeline shows months across forecast horizon

**Traceability:** PRD FR-3.1, Design Section 2.5

**Tasks:**
- [ ] T-4.1.1: Create event timeline component
- [ ] T-4.1.2: Load events from InstantDB
- [ ] T-4.1.3: Plot events on timeline
- [ ] T-4.1.4: Add color coding by event type
- [ ] T-4.1.5: Add hover tooltips with details

---

### US-4.2: Create a Funding Event
**As a** user  
**I want to** create a funding event  
**So that** I can model cash injections

**Acceptance Criteria:**
- I can open event creation modal
- I can enter event name
- I can select event type "Funding"
- I can specify event month
- I can enter funding amount
- Event is saved and applied to forecast

**Traceability:** PRD FR-3.1, Design Section 2.5

**Tasks:**
- [ ] T-4.2.1: Create event creation modal
- [ ] T-4.2.2: Implement event form fields
- [ ] T-4.2.3: Add event type selector
- [ ] T-4.2.4: Implement funding event creation
- [ ] T-4.2.5: Save event to InstantDB
- [ ] T-4.2.6: Apply funding to forecast

---

### US-4.3: Create a Hire Event
**As a** user  
**I want to** create a hire event  
**So that** I can model increased payroll costs

**Acceptance Criteria:**
- I can create hire event with name and month
- I can specify monthly cost increase
- I can specify target line item (e.g., "staff_costs")
- Cost increase applies from event month forward
- Forecast recalculates with hire

**Traceability:** PRD FR-3.2, Design Section 2.5

**Tasks:**
- [ ] T-4.3.1: Implement hire event form
- [ ] T-4.3.2: Add monthly cost input
- [ ] T-4.3.3: Add target line item selector
- [ ] T-4.3.4: Apply hire to forecast from event month
- [ ] T-4.3.5: Recalculate forecast

---

### US-4.4: Create a Client Win Event
**As a** user  
**I want to** create a client win event  
**So that** I can model new recurring revenue

**Acceptance Criteria:**
- I can create client win event with name and month
- I can specify monthly revenue amount
- I can specify target revenue line item
- Revenue applies from event month forward
- Forecast recalculates with client win

**Traceability:** PRD FR-3.2, Design Section 2.5

**Tasks:**
- [ ] T-4.4.1: Implement client win event form
- [ ] T-4.4.2: Add monthly revenue input
- [ ] T-4.4.3: Add target revenue line item selector
- [ ] T-4.4.4: Apply revenue from event month
- [ ] T-4.4.5: Recalculate forecast

---

### US-4.5: Create a Price Increase Event
**As a** user  
**I want to** create a price increase event  
**So that** I can model revenue uplifts

**Acceptance Criteria:**
- I can create price increase event with name and month
- I can specify percentage increase
- I can specify target (e.g., "revenue")
- Percentage applies from event month forward
- Forecast recalculates with price increase

**Traceability:** PRD FR-3.2, Design Section 2.5

**Tasks:**
- [ ] T-4.5.1: Implement price increase event form
- [ ] T-4.5.2: Add percentage input
- [ ] T-4.5.3: Add target selector
- [ ] T-4.5.4: Apply percentage from event month
- [ ] T-4.5.5: Recalculate forecast

---

### US-4.6: Edit an Event
**As a** user  
**I want to** edit an existing event  
**So that** I can adjust event details

**Acceptance Criteria:**
- I can click edit on any event
- Event form opens with current values
- I can modify any field
- Changes save correctly
- Forecast recalculates with updated event

**Traceability:** PRD FR-3.1, Design Section 2.5

**Tasks:**
- [ ] T-4.6.1: Add edit button to event cards
- [ ] T-4.6.2: Load event data into form
- [ ] T-4.6.3: Implement event update
- [ ] T-4.6.4: Save updated event to InstantDB
- [ ] T-4.6.5: Recalculate forecast

---

### US-4.7: Delete an Event
**As a** user  
**I want to** delete an event  
**So that** I can remove events that are no longer relevant

**Acceptance Criteria:**
- I can click delete on any event
- Confirmation dialog appears
- Event is removed from InstantDB
- Forecast recalculates without event
- Event disappears from timeline

**Traceability:** PRD FR-3.1, Design Section 2.5

**Tasks:**
- [ ] T-4.7.1: Add delete button to event cards
- [ ] T-4.7.2: Implement confirmation dialog
- [ ] T-4.7.3: Delete event from InstantDB
- [ ] T-4.7.4: Recalculate forecast
- [ ] T-4.7.5: Update timeline display

---

## User Journey: Using Presenter Mode

### US-5.1: Enter Presenter Mode
**As a** user  
**I want to** enter presenter mode  
**So that** I can show a clean view to clients

**Acceptance Criteria:**
- I can click "Presenter Mode" button
- Dashboard switches to presenter view
- All edit controls are hidden
- Clean, professional layout is displayed
- I can see all key information

**Traceability:** PRD FR-5.1, Design Section 2.6

**Tasks:**
- [ ] T-5.1.1: Create presenter mode component
- [ ] T-5.1.2: Add presenter mode toggle
- [ ] T-5.1.3: Hide all edit controls
- [ ] T-5.1.4: Implement presenter layout
- [ ] T-5.1.5: Load current forecast data

---

### US-5.2: View Business Summary in Presenter Mode
**As a** user  
**I want to** see business summary in presenter mode  
**So that** clients understand the context

**Acceptance Criteria:**
- Business name is prominently displayed
- Entity type is shown as badge
- Accounting basis is shown as badge
- All information is clearly visible

**Traceability:** PRD FR-5.1, Design Section 2.6 Header

**Tasks:**
- [ ] T-5.2.1: Create presenter header component
- [ ] T-5.2.2: Display business name
- [ ] T-5.2.3: Display entity type badge
- [ ] T-5.2.4: Display accounting basis badge
- [ ] T-5.2.5: Style header with navy background

---

### US-5.3: View Key Metrics in Presenter Mode
**As a** user  
**I want to** see key financial metrics in presenter mode  
**So that** clients can quickly understand forecast health

**Acceptance Criteria:**
- I can see Net Cash Position (end of period)
- I can see Peak Negative Cash Requirement
- I can see Break-Even Month
- I can see Cash Runway (months)
- I can see Revenue Growth (Y1-Y3 CAGR)
- Metrics are displayed in clear cards

**Traceability:** PRD FR-5.1, Design Section 2.6 Metrics

**Tasks:**
- [ ] T-5.3.1: Create presenter metric cards
- [ ] T-5.3.2: Calculate net cash position
- [ ] T-5.3.3: Calculate peak negative cash
- [ ] T-5.3.4: Calculate break-even month
- [ ] T-5.3.5: Calculate cash runway
- [ ] T-5.3.6: Calculate revenue growth CAGR
- [ ] T-5.3.7: Style metric cards with aqua accents

---

### US-5.4: View Charts in Presenter Mode
**As a** user  
**I want to** see visual charts in presenter mode  
**So that** clients can understand trends visually

**Acceptance Criteria:**
- I can see Net Cashflow line chart
- I can see Revenue & Expenses stacked bar chart
- I can see P&L Summary chart (optional)
- Charts are responsive and clear
- Tooltips show details on hover

**Traceability:** PRD FR-5.1, Design Section 2.6 Charts

**Tasks:**
- [ ] T-5.4.1: Create net cashflow line chart (Recharts)
- [ ] T-5.4.2: Create revenue/expenses stacked bar chart
- [ ] T-5.4.3: Create P&L summary chart (optional)
- [ ] T-5.4.4: Add chart tooltips
- [ ] T-5.4.5: Make charts responsive
- [ ] T-5.4.6: Highlight negative cash zones in red

---

### US-5.5: View Event Timeline in Presenter Mode
**As a** user  
**I want to** see event timeline in presenter mode  
**So that** clients understand forecast assumptions

**Acceptance Criteria:**
- I can see visual timeline of events
- Events are color-coded by type
- Event details are visible
- Timeline is clear and easy to understand

**Traceability:** PRD FR-5.1, Design Section 2.6 Events

**Tasks:**
- [ ] T-5.5.1: Create presenter event timeline
- [ ] T-5.5.2: Display events on timeline
- [ ] T-5.5.3: Color-code events by type
- [ ] T-5.5.4: Add event detail tooltips
- [ ] T-5.5.5: Add Framer Motion animations

---

### US-5.6: View Assumptions in Presenter Mode
**As a** user  
**I want to** see key assumptions in presenter mode  
**So that** clients understand calculation basis

**Acceptance Criteria:**
- I can see tax rate summaries
- I can see debtor/creditor days (if accrual)
- I can see accounting basis summary
- I can see key growth rates and margins
- Assumptions are in collapsible sections

**Traceability:** PRD FR-5.1, Design Section 2.6 Assumptions

**Tasks:**
- [ ] T-5.6.1: Create assumptions panel component
- [ ] T-5.6.2: Display tax rates
- [ ] T-5.6.3: Display working capital settings
- [ ] T-5.6.4: Display accounting basis
- [ ] T-5.6.5: Display growth rates and margins
- [ ] T-5.6.6: Implement accordion for sections

---

### US-5.7: Change Horizon in Presenter Mode
**As a** user  
**I want to** change forecast horizon in presenter mode  
**So that** I can show different time periods to clients

**Acceptance Criteria:**
- I can select 1Y, 3Y, 5Y, or 10Y
- Forecast recalculates
- Charts update to new horizon
- Metrics update to new horizon

**Traceability:** PRD FR-4.1, FR-5.1, Design Section 2.6

**Tasks:**
- [ ] T-5.7.1: Add horizon selector to presenter header
- [ ] T-5.7.2: Trigger recalculation on change
- [ ] T-5.7.3: Update charts for new horizon
- [ ] T-5.7.4: Update metrics for new horizon

---

### US-5.8: Export from Presenter Mode
**As a** user  
**I want to** export to Excel from presenter mode  
**So that** I can share the forecast with clients

**Acceptance Criteria:**
- I can click "Export to Excel" button
- Excel file downloads with all data
- Formulas are included and working
- File is properly formatted

**Traceability:** PRD FR-6.1, FR-6.2, Design Section 2.6 Footer

**Tasks:**
- [ ] T-5.8.1: Add export button to presenter footer
- [ ] T-5.8.2: Call export API endpoint
- [ ] T-5.8.3: Download Excel file
- [ ] T-5.8.4: Show success notification

---

### US-5.9: Exit Presenter Mode
**As a** user  
**I want to** exit presenter mode  
**So that** I can return to editing

**Acceptance Criteria:**
- I can click "Edit Mode" or "Back to Dashboard"
- I return to dashboard view
- All edit controls are restored
- Current data is preserved

**Traceability:** PRD FR-5.1, Design Section 2.6

**Tasks:**
- [ ] T-5.9.1: Add exit button to presenter header
- [ ] T-5.9.2: Implement mode switching
- [ ] T-5.9.3: Restore edit controls
- [ ] T-5.9.4: Preserve state

---

## User Journey: AI Recommendations

### US-6.1: View AI Recommendations
**As a** user  
**I want to** see AI-generated recommendations  
**So that** I can improve my forecast completeness

**Acceptance Criteria:**
- Recommendations panel is accessible
- I can see suggested revenue items
- I can see suggested expense items
- I can see suggested settings changes
- Recommendations are grouped by category

**Traceability:** PRD FR-7.1, Design Section 2.7

**Tasks:**
- [ ] T-6.1.1: Create recommendations panel component
- [ ] T-6.1.2: Call AI recommendations API
- [ ] T-6.1.3: Display recommendations by category
- [ ] T-6.1.4: Show recommendation explanations
- [ ] T-6.1.5: Handle loading and error states

---

### US-6.2: Add Recommended Revenue Item
**As a** user  
**I want to** add a recommended revenue item to my forecast  
**So that** I can include missing revenue streams

**Acceptance Criteria:**
- I can click "Add to Model" on a revenue recommendation
- Revenue item is added to forecast grid
- Item has suggested values pre-filled
- I can edit the item after adding

**Traceability:** PRD FR-7.1, Design Section 2.7

**Tasks:**
- [ ] T-6.2.1: Implement "Add to Model" button
- [ ] T-6.2.2: Create revenue line item from recommendation
- [ ] T-6.2.3: Pre-fill suggested values
- [ ] T-6.2.4: Add item to grid
- [ ] T-6.2.5: Save to InstantDB
- [ ] T-6.2.6: Recalculate forecast

---

### US-6.3: Add Recommended Expense Item
**As a** user  
**I want to** add a recommended expense item to my forecast  
**So that** I can include missing cost categories

**Acceptance Criteria:**
- I can click "Add to Model" on an expense recommendation
- Expense item is added to forecast grid
- Item has suggested values pre-filled
- I can edit the item after adding

**Traceability:** PRD FR-7.1, Design Section 2.7

**Tasks:**
- [ ] T-6.3.1: Implement "Add to Model" button for expenses
- [ ] T-6.3.2: Create expense line item from recommendation
- [ ] T-6.3.3: Pre-fill suggested values
- [ ] T-6.3.4: Add item to grid
- [ ] T-6.3.5: Save to InstantDB
- [ ] T-6.3.6: Recalculate forecast

---

### US-6.4: Apply Recommended Settings
**As a** user  
**I want to** apply recommended settings changes  
**So that** I can optimize my forecast configuration

**Acceptance Criteria:**
- I can see recommended settings changes
- I can click "Apply" on a recommendation
- Settings are updated
- Forecast recalculates with new settings

**Traceability:** PRD FR-7.1, Design Section 2.7

**Tasks:**
- [ ] T-6.4.1: Display settings recommendations
- [ ] T-6.4.2: Implement "Apply" button
- [ ] T-6.4.3: Update settings from recommendation
- [ ] T-6.4.4: Save settings to InstantDB
- [ ] T-6.4.5: Recalculate forecast

---

## User Journey: Exporting Data

### US-7.1: Export to Excel
**As a** user  
**I want to** export my forecast to Excel  
**So that** I can share and analyze data externally

**Acceptance Criteria:**
- I can click "Export to Excel" button
- Excel file downloads with all data
- File contains multiple sheets (Profile, Assumptions, Forecast, Summary)
- Formulas are included and working
- Formatting is professional

**Traceability:** PRD FR-6.1, FR-6.2

**Tasks:**
- [ ] T-7.1.1: Create export API endpoint
- [ ] T-7.1.2: Generate Excel workbook with ExcelJS
- [ ] T-7.1.3: Create Profile sheet
- [ ] T-7.1.4: Create Assumptions sheet
- [ ] T-7.1.5: Create Forecast sheet with formulas
- [ ] T-7.1.6: Create Summary sheet
- [ ] T-7.1.7: Implement formula calculations
- [ ] T-7.1.8: Apply professional formatting
- [ ] T-7.1.9: Return file as download
- [ ] T-7.1.10: Add export button to UI

---

## User Journey: Collaboration

### US-8.1: View Collaboration Notes
**As a** user  
**I want to** view collaboration notes  
**So that** I can see context from other users

**Acceptance Criteria:**
- I can see notes in the dashboard
- Notes are clearly displayed
- Notes support multi-line text
- Notes show last updated timestamp

**Traceability:** PRD FR-1.1

**Tasks:**
- [ ] T-8.1.1: Display notes in dashboard
- [ ] T-8.1.2: Format notes with line breaks
- [ ] T-8.1.3: Show last updated timestamp
- [ ] T-8.1.4: Style notes section

---

### US-8.2: Edit Collaboration Notes
**As a** user  
**I want to** edit collaboration notes  
**So that** I can add or update context

**Acceptance Criteria:**
- I can edit notes from dashboard
- Changes save automatically
- I can see my changes immediately
- Notes persist correctly

**Traceability:** PRD FR-1.1

**Tasks:**
- [ ] T-8.2.1: Add edit button to notes
- [ ] T-8.2.2: Create notes editor component
- [ ] T-8.2.3: Implement notes update
- [ ] T-8.2.4: Auto-save notes changes
- [ ] T-8.2.5: Update timestamp on save

---

## User Journey: Forecast Calculations

### US-9.1: Forecast Recalculates on Data Change
**As a** system  
**I want to** automatically recalculate the forecast when data changes  
**So that** users always see accurate projections

**Acceptance Criteria:**
- Forecast recalculates when line items change
- Forecast recalculates when settings change
- Forecast recalculates when events change
- All calculations are accurate
- Recalculation is fast (< 2 seconds)

**Traceability:** PRD Section 4.2, Section 5.1

**Tasks:**
- [ ] T-9.1.1: Implement forecast calculation engine
- [ ] T-9.1.2: Implement accounting basis calculations
- [ ] T-9.1.3: Implement VAT calculations
- [ ] T-9.1.4: Implement Corporation Tax calculations
- [ ] T-9.1.5: Implement PAYE/NIC calculations
- [ ] T-9.1.6: Implement dividend calculations
- [ ] T-9.1.7: Implement working capital adjustments
- [ ] T-9.1.8: Implement event application
- [ ] T-9.1.9: Trigger recalculation on data change
- [ ] T-9.1.10: Optimize calculation performance

---

## Implementation Priority

### Phase 1: Core Foundation (Must Have)
- US-1.1 through US-1.7: Profile creation
- US-2.1 through US-2.7: Basic forecast building
- US-9.1: Forecast calculation engine

### Phase 2: Settings & Configuration (Must Have)
- US-3.1 through US-3.5: Settings management
- US-2.2: Horizon selection

### Phase 3: Advanced Features (Should Have)
- US-4.1 through US-4.7: Event management
- US-5.1 through US-5.9: Presenter mode
- US-7.1: Excel export

### Phase 4: Enhancements (Nice to Have)
- US-6.1 through US-6.4: AI recommendations
- US-8.1 through US-8.2: Collaboration notes

---

## Traceability Matrix

| User Story | PRD Requirement | Design Section | Status |
|-----------|----------------|----------------|--------|
| US-1.1 | FR-1.1 | 2.1 | Pending |
| US-1.2 | FR-1.1 | 2.2 | Pending |
| US-1.3 | FR-1.1 | 2.2 Step 1 | Pending |
| US-1.4 | FR-1.1 | 2.2 Step 2 | Pending |
| US-1.5 | FR-1.2 | 2.2 Step 3, 2.4 | Pending |
| US-1.6 | FR-1.1 | 2.2 Step 4 | Pending |
| US-1.7 | FR-1.1 | 2.2 | Pending |
| US-2.1 | Section 4.2 | 2.3 | Pending |
| US-2.2 | FR-4.1 | 2.3 | Pending |
| US-2.3 | Section 4.2 | 2.3 | Pending |
| US-2.4 | Section 4.2 | 2.3 | Pending |
| US-2.5 | Section 4.2 | 2.3 | Pending |
| US-2.6 | Section 4.2 | 2.3 | Pending |
| US-2.7 | Section 4.2 | 2.3 | Pending |
| US-3.1 | FR-1.2 | 2.4 | Pending |
| US-3.2 | FR-2.1 | 2.4 | Pending |
| US-3.3 | FR-2.2 | 2.4 | Pending |
| US-3.4 | FR-2.3, FR-2.4, FR-2.5 | 2.4 | Pending |
| US-3.5 | FR-2.6 | 2.4 | Pending |
| US-4.1 | FR-3.1 | 2.5 | Pending |
| US-4.2 | FR-3.1, FR-3.2 | 2.5 | Pending |
| US-4.3 | FR-3.2 | 2.5 | Pending |
| US-4.4 | FR-3.2 | 2.5 | Pending |
| US-4.5 | FR-3.2 | 2.5 | Pending |
| US-4.6 | FR-3.1 | 2.5 | Pending |
| US-4.7 | FR-3.1 | 2.5 | Pending |
| US-5.1 | FR-5.1 | 2.6 | Pending |
| US-5.2 | FR-5.1 | 2.6 Header | Pending |
| US-5.3 | FR-5.1 | 2.6 Metrics | Pending |
| US-5.4 | FR-5.1 | 2.6 Charts | Pending |
| US-5.5 | FR-5.1 | 2.6 Events | Pending |
| US-5.6 | FR-5.1 | 2.6 Assumptions | Pending |
| US-5.7 | FR-4.1, FR-5.1 | 2.6 | Pending |
| US-5.8 | FR-6.1, FR-6.2 | 2.6 Footer | Pending |
| US-5.9 | FR-5.1 | 2.6 | Pending |
| US-6.1 | FR-7.1 | 2.7 | Pending |
| US-6.2 | FR-7.1 | 2.7 | Pending |
| US-6.3 | FR-7.1 | 2.7 | Pending |
| US-6.4 | FR-7.1 | 2.7 | Pending |
| US-7.1 | FR-6.1, FR-6.2 | - | Pending |
| US-8.1 | FR-1.1 | - | Pending |
| US-8.2 | FR-1.1 | - | Pending |
| US-9.1 | Section 4.2, Section 5.1 | - | Pending |

---

**Status:** Ready for Implementation  
**Next Step:** Begin implementation with Phase 1 user stories

