import ExcelJS from "exceljs";

// Helper function to convert column number to letter (1 = A, 2 = B, etc.)
function getColumnLetter(colNumber: number): string {
  let result = "";
  while (colNumber > 0) {
    colNumber--;
    result = String.fromCharCode(65 + (colNumber % 26)) + result;
    colNumber = Math.floor(colNumber / 26);
  }
  return result;
}
import type { BusinessProfile, CashflowScenario, LineItem, Event } from "@/types/database";
import { buildSeries } from "@/lib/cashflow/calculations";
import { buildEnhancedForecast, calculateForecastMetrics } from "@/lib/cashflow/enhanced-calculations";

type WorkbookInput = {
  profile: BusinessProfile;
  scenario: CashflowScenario;
  lineItems: LineItem[];
  events?: Event[];
};

const isExpenseType = (type: LineItem["type"]) => type === "cogs" || type === "opex";

export async function buildCashflowWorkbook(payload: WorkbookInput) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cashflow Builder";
  workbook.created = new Date();

  // Profile Sheet
  const profileSheet = workbook.addWorksheet("Profile");
  profileSheet.getCell("A1").value = "Business Profile";
  profileSheet.getCell("A2").value = "Name:";
  profileSheet.getCell("B2").value = payload.profile.name;
  profileSheet.getCell("A3").value = "Industry:";
  profileSheet.getCell("B3").value = payload.profile.industry;
  profileSheet.getCell("A4").value = "Entity Type:";
  profileSheet.getCell("B4").value = payload.profile.entity_type ?? "N/A";
  profileSheet.getCell("A5").value = "Accounting Basis:";
  profileSheet.getCell("B5").value = payload.profile.accounting_basis ?? "N/A";
  profileSheet.getCell("A6").value = "Description:";
  profileSheet.getCell("B6").value = payload.profile.description;

  // Assumptions Sheet
  const assumptionsSheet = workbook.addWorksheet("Assumptions");
  assumptionsSheet.getCell("A1").value = "Business Settings";
  assumptionsSheet.getCell("A2").value = "Entity Type:";
  assumptionsSheet.getCell("B2").value = payload.profile.entity_type ?? "N/A";
  assumptionsSheet.getCell("A3").value = "Accounting Basis:";
  assumptionsSheet.getCell("B3").value = payload.profile.accounting_basis ?? "N/A";
  assumptionsSheet.getCell("A4").value = "VAT Enabled:";
  assumptionsSheet.getCell("B4").value = payload.profile.vat_enabled ? "Yes" : "No";
  assumptionsSheet.getCell("A5").value = "VAT Basis:";
  assumptionsSheet.getCell("B5").value = payload.profile.vat_basis ?? "N/A";
  assumptionsSheet.getCell("A6").value = "Corporation Tax:";
  assumptionsSheet.getCell("B6").value = payload.profile.include_corporation_tax ? "Yes" : "No";
  assumptionsSheet.getCell("A7").value = "PAYE/NIC:";
  assumptionsSheet.getCell("B7").value = payload.profile.include_paye_nic ? "Yes" : "No";
  assumptionsSheet.getCell("A8").value = "Dividends:";
  assumptionsSheet.getCell("B8").value = payload.profile.include_dividends ? "Yes" : "No";
  assumptionsSheet.getCell("A9").value = "Debtor Days:";
  assumptionsSheet.getCell("B9").value = payload.profile.debtor_days ?? 0;
  assumptionsSheet.getCell("A10").value = "Creditor Days:";
  assumptionsSheet.getCell("B10").value = payload.profile.creditor_days ?? 0;
  assumptionsSheet.getCell("A11").value = "Director Salary:";
  assumptionsSheet.getCell("B11").value = payload.profile.director_salary ?? 0;
  assumptionsSheet.getCell("A12").value = "Dividend Payout Ratio:";
  assumptionsSheet.getCell("B12").value = payload.profile.dividend_payout_ratio ?? 0;

  // Forecast Sheet with Enhanced Calculations
  const forecastSheet = workbook.addWorksheet("Forecast");
  const months = payload.lineItems[0]?.monthly_values.length ?? 12;
  const events = payload.events ?? [];

  // Build enhanced forecast
  const enhancedSeries = buildEnhancedForecast({
    profile: payload.profile,
    lineItems: payload.lineItems,
    events,
    openingBalance: 0,
  });

  // Header row
  const header = ["Item", ...Array.from({ length: months }, (_, index) => `M${index + 1}`)];
  forecastSheet.addRow(header);

  let currentRow = 2;

  // Revenue items
  payload.lineItems
    .filter((item) => item.type === "revenue")
    .forEach((item) => {
      const row = forecastSheet.addRow([item.label, ...item.monthly_values.map((v) => Number(v.toFixed(2)))]);
      currentRow++;
    });

  // Total Revenue
  const revenueStartRow = 2;
  const revenueEndRow = currentRow - 1;
  const revenueRow = forecastSheet.addRow(["Total Revenue"]);
  for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
    const colLetter = getColumnLetter(colIndex);
    const formula = `SUM(${colLetter}${revenueStartRow}:${colLetter}${revenueEndRow})`;
    revenueRow.getCell(colIndex).value = { formula };
  }
  currentRow++;

  // COGS
  payload.lineItems
    .filter((item) => item.type === "cogs")
    .forEach((item) => {
      forecastSheet.addRow([item.label, ...item.monthly_values.map((v) => Number(v.toFixed(2)))]);
      currentRow++;
    });

  // OPEX
  payload.lineItems
    .filter((item) => item.type === "opex")
    .forEach((item) => {
      forecastSheet.addRow([item.label, ...item.monthly_values.map((v) => Number(v.toFixed(2)))]);
      currentRow++;
    });

  // Total Expenses
  const expenseStartRow = revenueEndRow + 2;
  const expenseEndRow = currentRow - 1;
  const expenseRow = forecastSheet.addRow(["Total Expenses"]);
  for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
    const colLetter = getColumnLetter(colIndex);
    const formula = `SUM(${colLetter}${expenseStartRow}:${colLetter}${expenseEndRow})`;
    expenseRow.getCell(colIndex).value = { formula };
  }
  currentRow++;

  // Working Capital (if accrual basis)
  const isAccrual = payload.profile.accounting_basis === "accrual";
  if (isAccrual && (payload.profile.debtor_days ?? 0) > 0) {
    const arRow = forecastSheet.addRow(["Accounts Receivable"]);
    for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
      const colLetter = getColumnLetter(colIndex);
      const monthIndex = colIndex - 2;
      const point = enhancedSeries[monthIndex];
      if (point) {
        arRow.getCell(colIndex).value = Number(point.accountsReceivable.toFixed(2));
      }
    }
    currentRow++;
  }

  if (isAccrual && (payload.profile.creditor_days ?? 0) > 0) {
    const apRow = forecastSheet.addRow(["Accounts Payable"]);
    for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
      const colLetter = getColumnLetter(colIndex);
      const monthIndex = colIndex - 2;
      const point = enhancedSeries[monthIndex];
      if (point) {
        apRow.getCell(colIndex).value = Number(point.accountsPayable.toFixed(2));
      }
    }
    currentRow++;
  }

  // VAT (if enabled) - with formulas
  if (payload.profile.vat_enabled) {
    const vatRate = 0.2; // 20% UK VAT rate
    const vatBasis = payload.profile.vat_basis ?? "accrual";
    const useAccrualVat = vatBasis === "accrual" && isAccrual;
    
    const vatCollectedRow = forecastSheet.addRow(["VAT Collected"]);
    const vatPaidRow = forecastSheet.addRow(["VAT Paid"]);
    const vatPayableRow = forecastSheet.addRow(["VAT Payable"]);
    
    for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
      const colLetter = getColumnLetter(colIndex);
      const revenueCol = getColumnLetter(colIndex);
      const revenueRowNum = revenueRow.number;
      
      if (useAccrualVat) {
        // VAT on invoiced revenue
        vatCollectedRow.getCell(colIndex).value = { formula: `${revenueCol}${revenueRowNum}*${vatRate}` };
      } else {
        // VAT on cash received (simplified - would need cash revenue tracking)
        const monthIndex = colIndex - 2;
        const point = enhancedSeries[monthIndex];
        vatCollectedRow.getCell(colIndex).value = Number((point?.vatCollected ?? 0).toFixed(2));
      }
      
      // VAT Paid (simplified - would need expense tracking)
      const monthIndex = colIndex - 2;
      const point = enhancedSeries[monthIndex];
      vatPaidRow.getCell(colIndex).value = Number((point?.vatPaid ?? 0).toFixed(2));
      
      // VAT Payable (quarterly)
      if ((monthIndex + 1) % 3 === 0) {
        // Calculate cumulative VAT for the quarter
        const quarterStart = Math.max(2, colIndex - 2);
        const quarterEnd = colIndex;
        const vatCollectedStart = getColumnLetter(quarterStart);
        const vatCollectedEnd = getColumnLetter(quarterEnd);
        const vatCollectedRowNum = vatCollectedRow.number;
        const vatPaidStart = getColumnLetter(quarterStart);
        const vatPaidEnd = getColumnLetter(quarterEnd);
        const vatPaidRowNum = vatPaidRow.number;
        vatPayableRow.getCell(colIndex).value = { 
          formula: `SUM(${vatCollectedStart}${vatCollectedRowNum}:${vatCollectedEnd}${vatCollectedRowNum})-SUM(${vatPaidStart}${vatPaidRowNum}:${vatPaidEnd}${vatPaidRowNum})` 
        };
      } else {
        vatPayableRow.getCell(colIndex).value = 0;
      }
    }
    currentRow += 3;
  }

  // Corporation Tax (if enabled) - with proper timing formulas
  if (payload.profile.include_corporation_tax) {
    const ctRow = forecastSheet.addRow(["Corporation Tax"]);
    const ctRate = 0.19; // 19% UK CT rate
    
    for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
      const monthIndex = colIndex - 2;
      const isYearEnd = (monthIndex + 1) % 12 === 0;
      const isPaymentMonth = (monthIndex + 1) % 12 === 9; // 9 months after year-end
      
      if (isYearEnd) {
        // Calculate CT on annual profit
        // Find revenue and expense totals for the year
        const yearStartMonth = Math.floor(monthIndex / 12) * 12;
        const yearStartCol = getColumnLetter(yearStartMonth + 2);
        const yearEndCol = getColumnLetter(colIndex);
        const revenueRowNum = revenueRow.number;
        const expenseRowNum = expenseRow.number;
        
        // Annual profit = revenue - expenses for the year
        const annualProfitFormula = `SUM(${yearStartCol}${revenueRowNum}:${yearEndCol}${revenueRowNum})-SUM(${yearStartCol}${expenseRowNum}:${yearEndCol}${expenseRowNum})`;
        ctRow.getCell(colIndex).value = { formula: `IF(${annualProfitFormula}>0,${annualProfitFormula}*${ctRate},0)` };
      } else if (isPaymentMonth && monthIndex >= 9) {
        // CT payment 9 months after year-end
        const yearEndCol = getColumnLetter(colIndex - 9);
        ctRow.getCell(colIndex).value = { formula: `${yearEndCol}${ctRow.number}` };
      } else {
        ctRow.getCell(colIndex).value = 0;
      }
    }
    currentRow++;
  }

  // PAYE/NIC (if enabled) - monthly formula
  if (payload.profile.include_paye_nic) {
    const payeNicRow = forecastSheet.addRow(["PAYE/NIC"]);
    const payrollRatio = 0.2; // 20% of expenses are payroll
    const employerNicRate = 0.138; // 13.8% employer NIC
    
    for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
      const colLetter = getColumnLetter(colIndex);
      const expenseRowNum = expenseRow.number;
      // PAYE/NIC = (Expenses * Payroll Ratio) * Employer NIC Rate
      payeNicRow.getCell(colIndex).value = { formula: `${colLetter}${expenseRowNum}*${payrollRatio}*${employerNicRate}` };
    }
    currentRow++;
  }

  // Dividends (if enabled) - simplified (cash constraint handled in calculation)
  if (payload.profile.include_dividends && payload.profile.dividend_payout_ratio) {
    const dividendRow = forecastSheet.addRow(["Dividends"]);
    for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
      const monthIndex = colIndex - 2;
      const point = enhancedSeries[monthIndex];
      // Use calculated value (already includes cash constraint)
      dividendRow.getCell(colIndex).value = Number((point?.dividends ?? 0).toFixed(2));
    }
    currentRow++;
  }

  // Net Cashflow - use calculated values (formulas would be too complex with conditional rows)
  const netCashRow = forecastSheet.addRow(["Net Cashflow"]);
  for (let colIndex = 2; colIndex <= months + 1; colIndex++) {
    const monthIndex = colIndex - 2;
    const point = enhancedSeries[monthIndex];
    if (point) {
      netCashRow.getCell(colIndex).value = Number(point.net.toFixed(2));
    }
  }
  currentRow++;

  // Cash Balance
  const cashBalanceRow = forecastSheet.addRow(["Cash Balance"]);
  const cashBalanceRowNum = cashBalanceRow.number;
  cashBalanceRow.getCell(2).value = enhancedSeries[0]?.openingBalance ?? 0;
  for (let colIndex = 3; colIndex <= months + 1; colIndex++) {
    const colLetter = getColumnLetter(colIndex);
    const prevColLetter = getColumnLetter(colIndex - 1);
    const netCashRowNum = netCashRow.number;
    const formula = `${prevColLetter}${cashBalanceRowNum}+${colLetter}${netCashRowNum}`;
    cashBalanceRow.getCell(colIndex).value = { formula };
  }

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary");
  const metrics = calculateForecastMetrics(enhancedSeries);
  summarySheet.getCell("A1").value = "Key Metrics";
  summarySheet.getCell("A2").value = "Net Cash Position:";
  summarySheet.getCell("B2").value = metrics.netCashPosition;
  summarySheet.getCell("A3").value = "Peak Negative Cash:";
  summarySheet.getCell("B3").value = metrics.peakNegativeCash;
  summarySheet.getCell("A4").value = "Break-Even Month:";
  summarySheet.getCell("B4").value = metrics.breakEvenMonth ?? "N/A";
  summarySheet.getCell("A5").value = "Cash Runway (Months):";
  summarySheet.getCell("B5").value = metrics.cashRunway ?? "N/A";
  summarySheet.getCell("A6").value = "Revenue Growth (Y1-Y3 CAGR):";
  summarySheet.getCell("B6").value = metrics.revenueGrowth ? `${metrics.revenueGrowth.toFixed(1)}%` : "N/A";

  return workbook.xlsx.writeBuffer();
}

