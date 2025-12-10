import type { LineItem, BusinessProfile, Event, AccountingBasis } from "@/types/database";

/**
 * Enhanced forecast series point containing all calculated values for a single month
 */
export type EnhancedSeriesPoint = {
  month: string;
  monthIndex: number;
  revenue: number;
  expenses: number;
  net: number;
  // Working capital
  accountsReceivable: number;
  accountsPayable: number;
  // VAT
  vatCollected: number;
  vatPaid: number;
  vatPayable: number;
  // Tax
  corporationTax: number;
  payeNic: number;
  // Dividends
  dividends: number;
  // Cash balance
  cashBalance: number;
  openingBalance: number;
};

type ForecastOptions = {
  profile: BusinessProfile;
  lineItems: LineItem[];
  events: Event[];
  openingBalance?: number;
};

/**
 * Enhanced forecast engine that handles comprehensive financial forecasting with:
 * 
 * **Accounting Basis:**
 * - Accrual: Revenue/expenses recognized when invoiced/incurred, cash timing adjusted by working capital
 * - Cash: Revenue/expenses recognized when cash received/paid (immediate)
 * 
 * **Working Capital (Accrual Only):**
 * - Debtor Days: Shifts revenue cash receipt forward based on payment terms
 * - Creditor Days: Shifts expense cash payment forward based on payment terms
 * - Tracks AR/AP balances monthly
 * 
 * **VAT Calculations:**
 * - Accrual VAT: Calculated on invoiced amounts
 * - Cash VAT: Calculated on cash received/paid
 * - Quarterly VAT payable (every 3 months)
 * 
 * **Corporation Tax:**
 * - Calculated at year-end on annual profit (accrual basis)
 * - Paid 9 months after year-end (month 21 for Year 1)
 * - Rate: 19% (UK standard rate)
 * 
 * **PAYE/NIC:**
 * - Monthly employer NIC calculated on payroll (assumed 20% of expenses)
 * - Rate: 13.8% employer NIC
 * 
 * **Dividends:**
 * - Calculated on post-tax profit
 * - Applied payout ratio (0-1)
 * - Constrained by available cash balance
 * 
 * **Event Tree System:**
 * - Funding: One-off cash injection at specified month
 * - Hire: Recurring expense increase from event month forward
 * - Client Win: Recurring revenue increase from event month forward
 * - Price Increase: Percentage uplift on revenue from event month forward
 * 
 * @param options - Forecast configuration
 * @param options.profile - Business profile with settings (entity type, accounting basis, tax toggles, working capital)
 * @param options.lineItems - Array of revenue, COGS, and OPEX line items with monthly values
 * @param options.events - Array of forecast events (funding, hires, client wins, price increases)
 * @param options.openingBalance - Starting cash balance (default: 0)
 * @returns Array of monthly forecast points with all calculated values (revenue, expenses, taxes, cash balance, etc.)
 * 
 * @example
 * ```typescript
 * const forecast = buildEnhancedForecast({
 *   profile: { entity_type: "limited_company", accounting_basis: "accrual", ... },
 *   lineItems: [...],
 *   events: [...],
 *   openingBalance: 10000
 * });
 * ```
 */
export function buildEnhancedForecast(options: ForecastOptions): EnhancedSeriesPoint[] {
  const { profile, lineItems, events, openingBalance = 0 } = options;
  const months = lineItems[0]?.monthly_values.length ?? 12;
  const accountingBasis = profile.accounting_basis ?? "accrual";
  const isAccrual = accountingBasis === "accrual";
  const isCash = accountingBasis === "cash";

  // Initialize series
  const series: EnhancedSeriesPoint[] = [];
  let currentCashBalance = openingBalance;
  let cumulativeVatPayable = 0;
  let annualProfit = 0; // Profit for current year (for CT calculation)
  let cumulativeProfit = 0; // Total profit across all years
  const ctLiabilities: Array<{ yearEndMonth: number; amount: number }> = []; // Track CT liabilities by year-end month

  // Working capital tracking
  const debtorDays = isAccrual ? (profile.debtor_days ?? 0) : 0;
  const creditorDays = isAccrual ? (profile.creditor_days ?? 0) : 0;
  const debtorMonths = Math.ceil(debtorDays / 30); // Months until payment received
  const creditorMonths = Math.ceil(creditorDays / 30); // Months until payment made
  
  // Track AR/AP by month when invoice/bill was issued
  const arSchedule: Map<number, number> = new Map(); // monthIndex -> amount to be received
  const apSchedule: Map<number, number> = new Map(); // monthIndex -> amount to be paid

  for (let monthIndex = 0; monthIndex < months; monthIndex++) {
    const monthLabel = getMonthLabel(monthIndex);

    // Calculate base revenue and expenses
    let revenue = sumByType(lineItems, "revenue", monthIndex);
    let expenses = sumByType(lineItems, "cogs", monthIndex) + sumByType(lineItems, "opex", monthIndex);

    // Apply events (events apply from their event_month forward)
    for (const event of events) {
      // Skip events that haven't occurred yet
      if (event.event_month > monthIndex + 1) continue;

      switch (event.event_type) {
        case "funding":
          // Funding is a one-off cash injection in the event month only
          if (event.amount && event.event_month === monthIndex + 1) {
            currentCashBalance += event.amount;
          }
          break;
        case "hire":
          // Hire events increase expenses from event month forward (recurring)
          if (event.amount) {
            expenses += event.amount;
          }
          break;
        case "client_win":
          // Client win events add recurring revenue from event month forward
          if (event.amount) {
            revenue += event.amount;
          }
          break;
        case "price_increase":
          // Price increase applies percentage uplift from event month forward
          if (event.percent_change) {
            revenue *= 1 + event.percent_change / 100;
          }
          break;
      }
    }

    // Working capital adjustments (only for accrual)
    let accountsReceivable = 0;
    let accountsPayable = 0;
    let cashRevenue = revenue;
    let cashExpenses = expenses;

    if (isAccrual && debtorDays > 0) {
      // Revenue recognized when invoiced (now), cash received later
      // Schedule cash receipt for future month
      const receiptMonth = monthIndex + debtorMonths;
      if (receiptMonth < months) {
        arSchedule.set(receiptMonth, (arSchedule.get(receiptMonth) ?? 0) + revenue);
      }
      
      // Calculate current AR balance (sum of all outstanding invoices)
      accountsReceivable = revenue; // This month's invoice
      // Add AR from previous months that haven't been paid yet
      for (let i = Math.max(0, monthIndex - debtorMonths + 1); i < monthIndex; i++) {
        const receiptMonthForI = i + debtorMonths;
        if (receiptMonthForI >= monthIndex) {
          const prevRevenue = series[i]?.revenue ?? 0;
          accountsReceivable += prevRevenue;
        }
      }
      
      // Cash received this month (from invoices issued in previous months)
      cashRevenue = arSchedule.get(monthIndex) ?? 0;
    } else {
      // Cash basis: revenue = cash received immediately
      cashRevenue = revenue;
      accountsReceivable = 0;
    }

    if (isAccrual && creditorDays > 0) {
      // Expenses recognized when incurred (now), cash paid later
      // Schedule cash payment for future month
      const paymentMonth = monthIndex + creditorMonths;
      if (paymentMonth < months) {
        apSchedule.set(paymentMonth, (apSchedule.get(paymentMonth) ?? 0) + expenses);
      }
      
      // Calculate current AP balance (sum of all outstanding bills)
      accountsPayable = expenses; // This month's bill
      // Add AP from previous months that haven't been paid yet
      for (let i = Math.max(0, monthIndex - creditorMonths + 1); i < monthIndex; i++) {
        const paymentMonthForI = i + creditorMonths;
        if (paymentMonthForI >= monthIndex) {
          const prevExpenses = series[i]?.expenses ?? 0;
          accountsPayable += prevExpenses;
        }
      }
      
      // Cash paid this month (for bills incurred in previous months)
      cashExpenses = apSchedule.get(monthIndex) ?? 0;
    } else {
      // Cash basis: expenses = cash paid immediately
      cashExpenses = expenses;
      accountsPayable = 0;
    }

    // VAT calculations
    let vatCollected = 0;
    let vatPaid = 0;
    let vatPayable = 0;

    if (profile.vat_enabled) {
      const vatRate = 0.2; // 20% UK VAT rate
      const vatBasis = profile.vat_basis ?? "accrual";
      const useAccrualVat = vatBasis === "accrual" && isAccrual;
      const useCashVat = vatBasis === "cash" || isCash;

      if (useAccrualVat) {
        // VAT on invoiced amounts
        vatCollected = revenue * vatRate;
        vatPaid = expenses * vatRate;
      } else if (useCashVat) {
        // VAT on cash received/paid
        vatCollected = cashRevenue * vatRate;
        vatPaid = cashExpenses * vatRate;
      }

      // VAT payable quarterly (simplified: every 3 months)
      if ((monthIndex + 1) % 3 === 0) {
        vatPayable = cumulativeVatPayable + (vatCollected - vatPaid);
        cumulativeVatPayable = 0;
      } else {
        cumulativeVatPayable += vatCollected - vatPaid;
      }
    }

    // Accumulate annual profit for CT calculation (accrual basis)
    const monthlyProfit = revenue - expenses;
    annualProfit += monthlyProfit;
    cumulativeProfit += monthlyProfit;

    // Corporation Tax (only for Limited Company)
    let corporationTax = 0;
    if (profile.entity_type === "limited_company" && profile.include_corporation_tax) {
      const isYearEnd = (monthIndex + 1) % 12 === 0;
      
      if (isYearEnd) {
        // Calculate CT on annual profit (accrual basis) at year-end
        const ctRate = 0.19; // 19% UK Corporation Tax rate
        const ctAmount = annualProfit > 0 ? annualProfit * ctRate : 0;
        
        // Store CT liability to be paid 9 months after year-end
        if (ctAmount > 0) {
          ctLiabilities.push({
            yearEndMonth: monthIndex,
            amount: ctAmount,
          });
        }
        
        // Reset annual profit for next year
        annualProfit = 0;
      }
      
      // Check if this is a CT payment month (9 months after a year-end)
      const paymentMonth = ctLiabilities.find(
        (liability) => monthIndex === liability.yearEndMonth + 9
      );
      
      if (paymentMonth) {
        corporationTax = paymentMonth.amount;
      }
    }

    // PAYE/NIC
    let payeNic = 0;
    if (profile.include_paye_nic) {
      // Simplified: assume 20% of expenses are payroll
      const payroll = expenses * 0.2;
      const employerNic = payroll * 0.138; // 13.8% employer NIC
      payeNic = employerNic; // Monthly PAYE/NIC
    }

    // Dividends (only for Limited Company)
    let dividends = 0;
    if (
      profile.entity_type === "limited_company" &&
      profile.include_dividends &&
      profile.dividend_payout_ratio
    ) {
      // Calculate post-tax profit
      const postTaxProfit = cumulativeProfit - corporationTax;
      const dividendAmount = postTaxProfit * profile.dividend_payout_ratio;
      // Dividends cannot exceed available cash
      dividends = Math.min(dividendAmount, currentCashBalance);
    }

    // Net cashflow
    const netCashflow =
      cashRevenue - cashExpenses - vatPayable - corporationTax - payeNic - dividends;

    // Update cash balance
    currentCashBalance += netCashflow;

    series.push({
      month: monthLabel,
      monthIndex,
      revenue: isCash ? cashRevenue : revenue,
      expenses: isCash ? cashExpenses : expenses,
      net: netCashflow,
      accountsReceivable,
      accountsPayable,
      vatCollected,
      vatPaid,
      vatPayable,
      corporationTax,
      payeNic,
      dividends,
      cashBalance: currentCashBalance,
      openingBalance: monthIndex === 0 ? openingBalance : series[monthIndex - 1]?.cashBalance ?? 0,
    });
  }

  return series;
}

/**
 * Get month label for a given month index (0-11 maps to Jan-Dec, repeats for multi-year)
 * 
 * @param monthIndex - Zero-based month index (0 = January, 11 = December, 12 = January of next year, etc.)
 * @returns Three-letter month abbreviation
 */
function getMonthLabel(monthIndex: number): string {
  const MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return MONTH_LABELS[monthIndex % 12];
}

/**
 * Sum monthly values for line items of a specific type
 * 
 * @param lineItems - Array of line items to filter and sum
 * @param type - Line item type to filter by (revenue, cogs, opex)
 * @param monthIndex - Zero-based month index to sum values for
 * @returns Sum of monthly values for the specified type and month
 */
function sumByType(lineItems: LineItem[], type: LineItem["type"], monthIndex: number): number {
  return lineItems
    .filter((item) => item.type === type)
    .reduce((total, item) => {
      return total + (item.monthly_values[monthIndex] ?? 0);
    }, 0);
}

/**
 * Calculate key financial metrics from enhanced forecast series
 * 
 * **Metrics Calculated:**
 * - Net Cash Position: Final cash balance at end of forecast period
 * - Peak Negative Cash: Lowest cash balance (most negative) during forecast
 * - Break-Even Month: First month where net cashflow >= 0 (1-indexed, null if never breaks even)
 * - Cash Runway: Number of months until cash is exhausted (null if cash lasts entire period)
 * - Revenue Growth: CAGR (Compound Annual Growth Rate) from Year 1 to Year 3
 * 
 * @param series - Array of enhanced forecast points from buildEnhancedForecast
 * @returns Object containing:
 *   - netCashPosition: Final cash balance
 *   - peakNegativeCash: Most negative cash balance (0 if never negative)
 *   - breakEvenMonth: Month number when break-even occurs (null if never)
 *   - cashRunway: Months until cash exhausted (null if cash lasts entire period)
 *   - revenueGrowth: CAGR percentage (0 if insufficient data)
 * 
 * @example
 * ```typescript
 * const metrics = calculateForecastMetrics(forecastSeries);
 * console.log(`Cash runway: ${metrics.cashRunway} months`);
 * console.log(`Break-even: Month ${metrics.breakEvenMonth}`);
 * ```
 */
export function calculateForecastMetrics(series: EnhancedSeriesPoint[]) {
  if (series.length === 0) {
    return {
      netCashPosition: 0,
      peakNegativeCash: 0,
      breakEvenMonth: null,
      cashRunway: null,
      revenueGrowth: 0,
    };
  }

  const netCashPosition = series[series.length - 1]?.cashBalance ?? 0;
  
  // Find peak negative cash requirement
  const negativeCashPoints = series.filter((p) => p.cashBalance < 0);
  const peakNegativeCash = negativeCashPoints.length > 0
    ? Math.min(...negativeCashPoints.map((p) => p.cashBalance))
    : 0;

  // Find break-even month (first month where net >= 0)
  const breakEvenMonth = series.findIndex((p) => p.net >= 0);
  const breakEvenMonthNumber = breakEvenMonth >= 0 ? breakEvenMonth + 1 : null;

  // Calculate cash runway (months until cash exhausted)
  let cashRunway: number | null = null;
  for (let i = 0; i < series.length; i++) {
    if (series[i].cashBalance <= 0 && i > 0) {
      cashRunway = i;
      break;
    }
  }
  if (cashRunway === null && series[series.length - 1].cashBalance > 0) {
    cashRunway = series.length; // Cash lasts entire forecast period
  }

  // Calculate revenue growth (CAGR for first 3 years if available)
  const year1Revenue = series.slice(0, 12).reduce((sum, p) => sum + p.revenue, 0);
  const year3Revenue = series.length >= 36 
    ? series.slice(24, 36).reduce((sum, p) => sum + p.revenue, 0)
    : null;
  
  let revenueGrowth = 0;
  if (year3Revenue && year1Revenue > 0) {
    // CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
    revenueGrowth = (Math.pow(year3Revenue / year1Revenue, 1 / 2) - 1) * 100;
  }

  return {
    netCashPosition,
    peakNegativeCash,
    breakEvenMonth: breakEvenMonthNumber,
    cashRunway,
    revenueGrowth,
  };
}

