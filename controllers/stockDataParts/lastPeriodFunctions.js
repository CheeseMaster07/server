export function TTM(statement, metric, yearsAgo, periods, i) {
  try {
    //console.log(periods)
    //console.log(i)
    //console.log(statement[periods[i - (0 + (4 * yearsAgo))]])
    return Number(statement[periods[i - (0 + (4 * yearsAgo))]]?.[metric]) +
      Number(statement[periods[i - (1 + (4 * yearsAgo))]]?.[metric]) +
      Number(statement[periods[i - (2 + (4 * yearsAgo))]]?.[metric]) +
      Number(statement[periods[i - (3 + (4 * yearsAgo))]]?.[metric])
  } catch (error) {

    return Number(statement[periods[i]]?.[metric]) +
      Number(statement[periods[i]]?.[metric]) +
      Number(statement[periods[i]]?.[metric]) +
      Number(statement[periods[i]]?.[metric])
  }

}

export function average(statement, metric, years, periods, i) {
  let result = 0
  for (let y = 1; y <= years; y++) {

    result = result + (TTM(statement, metric, y - 1, periods, i) / 4)
  }
  return result / years
}

export function average_Multiple(statement, metric, years) {
  const currentDate = new Date()
  const year = currentDate.getFullYear(); // e.g., 2023
  const month = currentDate.getMonth() + 1; // months are zero-based, so add 1 (e.g., 7 for July)
  const day = currentDate.getDate(); // e.g., 13
  const allMultiples = []
  const oldestYear = (year - years) + '-' + month + '-' + day

  statement.filter(period => new Date(period.date).getTime() > new Date(oldestYear).getTime()).forEach(period => {
    allMultiples.push(period[metric])
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

export function streak(stockData) {
  let netIncomeProfitable = 0
  let freeCashflowProfitable = 0
  let dividendsStreak = 0
  Object.keys(stockData.fundamentals.financialStatements.Income_Statement.yearly).some(fiscalYear => {
    const netIncome = stockData.fundamentals.financialStatements.Income_Statement.yearly[fiscalYear].netIncome
    if (Number(netIncome) > 0) {
      netIncomeProfitable = netIncomeProfitable + 1
      return false
    } else {
      return true
    }
  })
  Object.keys(stockData.fundamentals.financialStatements.Cash_Flow.yearly).some(fiscalYear => {
    const freeCashFlow = stockData.fundamentals.financialStatements.Cash_Flow.yearly[fiscalYear].freeCashFlow
    if (Number(freeCashFlow) > 0) {
      freeCashflowProfitable = freeCashflowProfitable + 1
      return false
    } else {
      return true
    }
  })
  Object.keys(stockData.dividendsData.yearly).some(fiscalYear => {
    const dividendsPerShare = stockData.dividendsData.yearly[fiscalYear].dividendsPerShare
    if (Number(dividendsPerShare) > 0) {
      dividendsStreak = dividendsStreak + 1
      return false
    } else {
      return true
    }
  })
  return { netIncome: netIncomeProfitable, freeCashflow: freeCashflowProfitable, dividends: dividendsStreak }
}

export function payoff(stockData, periods, i, quarterlyIncomeStatement, quarterlyCashflowStatement) {
  const netIncome = TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i)
  const freeCashflow = TTM(quarterlyCashflowStatement, 'freeCashFlow', 0, periods, i)
  const totalDebt = Number(stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[Object.keys(stockData.fundamentals.financialStatements.Balance_Sheet.quarterly)[0]].shortLongTermDebtTotal)

  return { netIncome: (totalDebt / netIncome), freeCashflow: (totalDebt / freeCashflow) }
}

export function yearlyGain(objStatement, metric, years, type, segment) {
  const keys = Object.keys(objStatement)
  let latestYear
  let latestValue
  let oldestValue
  if (!objStatement[keys[keys.length - 1]]) {
    return null
  } else {
    if (segment == 'buybacks') {
      const latestPeriod = keys[0]
      let year = Number(latestPeriod.split('-')[0])
      let month = latestPeriod.split('-')[1]
      let day = latestPeriod.split('-')[2]
      latestValue = objStatement[latestPeriod][metric]
      if (objStatement[`${year - years}-${month}-${day}`]) {
        oldestValue = objStatement[`${year - years}-${month}-${day}`][metric]
      } else {
        let i = 0
        while (!objStatement[`${year - years + i}-${month}-${day}`]) {
          i = i + 1
        }

        oldestValue = objStatement[`${year - years + i}-${month}-${day}`][metric]
      }

      if (type == 'CAGR') {
        return (((latestValue / oldestValue) ** (1 / years)) - 1) * 100
      } else {
        return ((latestValue - oldestValue) / oldestValue) * 100
      }
    }



    latestYear = objStatement[keys[keys.length - 1]].year
    latestValue = objStatement[latestYear][metric]
    if (objStatement[latestYear - years]) {
      oldestValue = objStatement[latestYear - years][metric]
    } else {
      let i = 0
      while (!objStatement[latestYear - years + i]) {
        i = i + 1
      }
      oldestValue = objStatement[latestYear - years + i][metric]
    }

    if (type == 'CAGR') {
      return (((latestValue / oldestValue) ** (1 / years)) - 1) * 100
    } else {
      return ((latestValue - oldestValue) / oldestValue) * 100
    }
  }
}

export function yearlyAverage(objStatement, metric, years) {
  const keys = Object.keys(objStatement)

  if (!objStatement[keys[keys.length - 1]]) {
    return null
  } else {
    const latestYear = objStatement[keys[keys.length - 1]].year
    let sum = 0
    for (let i = 0; i < years; i++) {
      if (!objStatement[keys[keys.length - (1 + i)]]) {
        break
      }
      sum = sum + objStatement[keys[keys.length - (1 + i)]][metric]

    }
    return sum / years
  }
}

export function sharePriceGain(stockData, calcType, unit, unitsAgo) {
  const latestDate = stockData.priceAction[stockData.priceAction.length - 1].date
  let oldestDate
  switch (unit) {
    case 'days':
      oldestDate = new Date(latestDate);
      oldestDate.setDate(new Date(latestDate).getDate() - unitsAgo);

      break;
    case 'weeks':
      oldestDate = new Date(latestDate);
      oldestDate.setDate(new Date(latestDate).getDate() - (unitsAgo * 7));

      break;
    case 'months':
      const newMonth = new Date(latestDate).getMonth() - unitsAgo;
      const newYear = new Date(latestDate).getFullYear() - Math.floor(newMonth / 12);
      const adjustedMonth = (newMonth + 12) % 12;

      oldestDate = new Date(newYear, adjustedMonth, new Date(latestDate).getDate());


      break;
    case 'YTD':
      oldestDate = new Date(`${latestDate.split('-')[0]}-01-02`)

      break;
    case 'years':
      oldestDate = new Date(`${latestDate.split('-')[0] - unitsAgo}-${latestDate.split('-')[1]}-${latestDate.split('-')[2]}`)

      break;

    default:
      break;
  }

  const oneDayInMilliseconds = 24 * 60 * 60 * 1000
  const latestPeriod = stockData.priceAction[stockData.priceAction.length - 1]
  let oldPeriod
  try {
    oldPeriod = stockData.priceAction
      .filter(period => new Date(period.date) <= oldestDate) // Filter dates before or equal to oldestDate
      .reduce((prev, curr) => {
        const prevDate = new Date(prev.date);
        const currDate = new Date(curr.date);
        return currDate > prevDate ? curr : prev; // Find the closest date
      });
  } catch {
    oldPeriod = stockData.priceAction[0]
  }



  if (calcType == 'CAGR') {
    return (((latestPeriod.adjusted_close / oldPeriod.adjusted_close) ** (1 / unitsAgo)) - 1) * 100

  } else if (calcType == 'cumulative') {

    return ((latestPeriod.adjusted_close - oldPeriod.adjusted_close) / oldPeriod.adjusted_close) * 100

  }

}