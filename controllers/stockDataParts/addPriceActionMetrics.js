export default function addPriceActionMetrics(i, periods, priceAction, startDate, endDate, fundamentalPeriod, quarterlyIncomeStatement, quarterlyBalanceSheet, quarterlyCashflowStatement, quarterlyStatistics) {
  for (let j = 0; j < priceAction.length; j++) {
    const pricePeriod = priceAction[j];
    const priceDate = new Date(pricePeriod.date);

    if (priceDate >= startDate && priceDate <= endDate) {
      function addTMM(statement, metric) {
        try {
          return Number(statement[periods[i]][metric]) +
            Number(statement[periods[i - 1]][metric]) +
            Number(statement[periods[i - 2]][metric]) +
            Number(statement[periods[i - 3]][metric])
        } catch {
          try {
            return Number(statement[periods[i]][metric])
          } catch {
            return 0
          }
        }

      }
      const revenueTTM = addTMM(quarterlyIncomeStatement, 'totalRevenue')
      const ebitTTM = addTMM(quarterlyIncomeStatement, 'operatingIncome')
      const netIncomeTTM = addTMM(quarterlyIncomeStatement, 'netIncome')
      const freeCashflowTTM = addTMM(quarterlyCashflowStatement, 'freeCashFlow')
      const bookValue = quarterlyBalanceSheet[fundamentalPeriod]?.totalStockholderEquity
      pricePeriod.marketCap = quarterlyStatistics[fundamentalPeriod]?.sharesOutstanding * pricePeriod?.adjusted_close;
      pricePeriod.enterpriceValue = pricePeriod?.marketCap +
        Number(quarterlyBalanceSheet[fundamentalPeriod]?.shortLongTermDebtTotal) -
        Number(quarterlyBalanceSheet[fundamentalPeriod]?.cashAndEquivalents) -
        Number(quarterlyBalanceSheet[fundamentalPeriod]?.shortTermInvestments)
      pricePeriod.priceSales = pricePeriod.marketCap / revenueTTM
      pricePeriod.priceEarnings = pricePeriod.marketCap / netIncomeTTM
      pricePeriod.priceBook = pricePeriod.marketCap / bookValue
      pricePeriod.priceFreeCashflow = pricePeriod.marketCap / freeCashflowTTM
      pricePeriod.enterpriceValueEbit = pricePeriod.enterpriceValue / ebitTTM
      //console.log(pricePeriod)

    }
  }
}