export default function formatStatements(stockData) {
  stockData.fundamentals.financialStatements.Statistics = {
    yearly: {},
    quarterly: {},
  }

  function TTM(report, metric, dividedMetric, currentIndex, quarterlyEntries) {
    try {
      const metricSum =
        Number(report[metric]) +
        Number(quarterlyEntries[currentIndex + 1][1][metric]) +
        Number(quarterlyEntries[currentIndex + 2][1][metric]) +
        Number(quarterlyEntries[currentIndex + 3][1][metric]);

      return metricSum / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[report.date]?.[dividedMetric]
    } catch (error) {
      return (
        (Number(report[metric]) * 4) /
        stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[report.date]?.[dividedMetric]
      );
    }
  }
  const yearlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.yearly);
  const quarterlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.quarterly);

  for (const [index, [key, report]] of Array.from(yearlyEntries.entries())) {
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);
    report.grossProfit = Number(report.totalRevenue) - Number(report.costOfRevenue)
    report.operatingIncome = Number(report.grossProfit) - Number(report.totalOperatingExpenses);
    report.EPS = stockData.fundamentals.earnings.Annual[key]?.epsActual;


    stockData.fundamentals.financialStatements.Statistics.yearly[report.date] = {
      sharesOutstanding: stockData.fundamentals.outstandingShares.annual[index]?.shares,
      grossMargin: Number(report.grossProfit) / Number(report.totalRevenue),
      operatingMargin: Number(report.operatingIncome) / Number(report.totalRevenue),
      netMargin: Number(report.netIncome) / Number(report.totalRevenue),
      freeCashflowMargin: Number(stockData.fundamentals.financialStatements.Cash_Flow.yearly[key]?.freeCashFlow) / Number(report.totalRevenue),
      returnOnAssets: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalAssets,
      returnOnEquity: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalStockholderEquity,
      currentRatio: stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalCurrentAssets / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalCurrentLiabilities,
      quickRatio: stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.cashAndEquivalents / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalCurrentLiabilities,
    };

    stockData.buybacks.yearly[report.date] = {
      sharesOutstanding: stockData.fundamentals.outstandingShares.annual[index]?.shares,
      salePurchaseOfStock: Number(stockData.fundamentals.financialStatements.Cash_Flow.yearly[key]?.salePurchaseOfStock),
      stockBasedCompensation: Number(stockData.fundamentals.financialStatements.Cash_Flow.yearly[key]?.stockBasedCompensation),
      freeCashFlow: Number(stockData.fundamentals.financialStatements.Cash_Flow.yearly[key]?.freeCashFlow),
    };
  }

  for (const [index, [key, report]] of Array.from(quarterlyEntries.entries())) {
    // console.log(index)
    // console.log(key)
    // console.log(report)
    //console.log(Array.from(quarterlyEntries.entries())[index])

    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);
    report.grossProfit = Number(report.totalRevenue) - Number(report.costOfRevenue)
    report.operatingIncome = Number(report.grossProfit) - Number(report.totalOperatingExpenses);
    report.EPS = stockData.fundamentals.earnings.History[key]?.epsActual;

    stockData.fundamentals.financialStatements.Statistics.quarterly[report.date] = {
      date: report.date,
      filing_date: report.filing_date,
      sharesOutstanding: stockData.fundamentals.outstandingShares.quarterly[index]?.shares,
      grossMargin: Number(report.grossProfit) / Number(report?.totalRevenue),
      operatingMargin: Number(report.operatingIncome) / Number(report?.totalRevenue),
      netMargin: Number(report.netIncome) / Number(report?.totalRevenue),
      freeCashflowMargin: Number(stockData.fundamentals.financialStatements.Cash_Flow.quarterly[key]?.freeCashFlow) / Number(report?.totalRevenue),

      returnOnAssets: TTM(report, 'netIncome', 'totalAssets', index, quarterlyEntries),
      returnOnEquity: TTM(report, 'netIncome', 'totalStockholderEquity', index, quarterlyEntries),

      currentRatio: stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalCurrentAssets / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalCurrentLiabilities,
      quickRatio: stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.cashAndEquivalents / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalCurrentLiabilities,
    };

    stockData.buybacks.quarterly[report.date] = {
      sharesOutstanding: stockData.fundamentals.outstandingShares.quarterly[index]?.shares,
      salePurchaseOfStock: Number(stockData.fundamentals.financialStatements.Cash_Flow.quarterly[key]?.salePurchaseOfStock),
      stockBasedCompensation: Number(stockData.fundamentals.financialStatements.Cash_Flow.quarterly[key]?.stockBasedCompensation),
      freeCashFlow: Number(stockData.fundamentals.financialStatements.Cash_Flow.quarterly[key]?.freeCashFlow),
    };
  }
}