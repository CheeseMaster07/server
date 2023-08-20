
export default async function addDCF(stockData, TTM, average, average_Multiple, five_years, ten_years, periods, i, quarterlyIncomeStatement, quarterlyStatistics) {
  stockData.fundamentals.dcf.growth = {
    tenYears: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) / TTM(quarterlyIncomeStatement, 'totalRevenue', ten_years, periods, i)) ** (1 / ten_years)) - 1) * 100,
    fiveYears: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) / TTM(quarterlyIncomeStatement, 'totalRevenue', five_years, periods, i)) ** (1 / five_years)) - 1) * 100,
    oneYear: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) / TTM(quarterlyIncomeStatement, 'totalRevenue', 1, periods, i)) ** (1 / 1)) - 1) * 100,
  }

  stockData.fundamentals.dcf.profitMargin = {
    tenYears: average(quarterlyStatistics, 'netMargin', ten_years, periods, i),
    fiveYears: average(quarterlyStatistics, 'netMargin', five_years, periods, i),
    oneYear: average(quarterlyStatistics, 'netMargin', 1, periods, i),
  }

  stockData.fundamentals.dcf.freeCashflowMargin = {
    tenYears: average(quarterlyStatistics, 'freeCashflowMargin', ten_years, periods, i),
    fiveYears: average(quarterlyStatistics, 'freeCashflowMargin', five_years, periods, i),
    oneYear: average(quarterlyStatistics, 'freeCashflowMargin', 1, periods, i),
  }

  stockData.fundamentals.dcf.earningsMultiple = {
    tenYears: average_Multiple(stockData.priceAction, 'priceEarnings', ten_years),
    fiveYears: average_Multiple(stockData.priceAction, 'priceEarnings', five_years),
    oneYear: average_Multiple(stockData.priceAction, 'priceEarnings', 1),
  }

  stockData.fundamentals.dcf.freeCashflowMultiple = {
    tenYears: average_Multiple(stockData.priceAction, 'priceFreeCashflow', ten_years),
    fiveYears: average_Multiple(stockData.priceAction, 'priceFreeCashflow', five_years),
    oneYear: average_Multiple(stockData.priceAction, 'priceFreeCashflow', 1),
  }
}