export default async function addDividends(stockData, i, periods, fundamentalYear, fundamentalMonth, quarterlyCashflowStatement, quarterlyIncomeStatement) {
  for (let j = 0; j < Object.keys(stockData.dividendsData.yearly).length; j++) {
    const dividendsPeriod = stockData.dividendsData.yearly[Object.keys(stockData.dividendsData.yearly)[j]];


    const dividendsYear = dividendsPeriod.year;

    if (dividendsYear == fundamentalYear && fundamentalMonth == 12) {
      function addTMM(statement, metric) {
        try {
          //console.log(periods)
          // console.log('ok', Number(statement[periods[i]][metric]))
          // console.log('ok - 1', statement[periods[i - 1]][metric])
          // console.log('ok - 2', statement[periods[i - 2]][metric])
          // console.log('ok - 3', statement[periods[i - 3]][metric])
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
      function average_Price(year) {
        const allMultiples = []

        stockData.priceAction.filter(period => Number(period.date.split('-')[0]) == Number(year)).forEach(period => {
          allMultiples.push(period.adjusted_close)
        })

        function sumArrayElements(array) {
          let sum = 0;
          for (let i = 0; i < array.length; i++) {
            sum += array[i];
          }
          return sum;
        }
        return sumArrayElements(allMultiples) / allMultiples.length

      }

      //console.log(quarterlyCashflowStatement)
      // console.log(dividendsPeriod)
      //console.log(addTMM(quarterlyCashflowStatement, 'freeCashFlow'))

      dividendsPeriod.totalDividendsPaid = addTMM(quarterlyCashflowStatement, 'dividendsPaid')
      dividendsPeriod.freeCashflow = addTMM(quarterlyCashflowStatement, 'freeCashFlow')
      dividendsPeriod.dividendsYield = dividendsPeriod.dividendsPerShare / average_Price(dividendsYear)
      dividendsPeriod.payoutRatio = dividendsPeriod.totalDividendsPaid / addTMM(quarterlyIncomeStatement, 'netIncome')

    }
  }
}