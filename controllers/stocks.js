import mongoose from 'mongoose'
import Stock from '../models/stock.js'


export const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}, { ticker: 1, 'general.Name': 1 })
    res.status(200).json(stocks)

  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const getStock = async (req, res) => {
  const ticker = req.params.id.toUpperCase()
  const stock = await Stock.find({ ticker: ticker })

  if (!stock.length) {
    const stockData = await fetchStockData(ticker)

    if (stockData == 'error') {
      res.status(200).json({ message: 'Stock not enough data' })
    }
    const newStockData = new Stock({
      ticker: stockData.ticker,
      general: stockData.general,
      fundamentals: stockData.fundamentals,
      priceAction: stockData.priceAction,
      dividendsData: stockData.dividendsData,
      buybacks: stockData.buybacks,
      secFilings: stockData.secFilings,
      competition: stockData.competition,
    })
    try {
      await newStockData.save()
    } catch { }

    try {
      res.status(200).json(stockData)
    } catch (err) {
      if (stockData != 'error') {
        res.status(404).json({ message: err.message })

      }
    }
  } else {
    try {
      await postCompetitors(stock[0])

      await stock[0].save()
    } catch (err) {
      console.log(err)
    }

    res.status(200).json(stock[0])
    // try {
    //   const stockData = await fetchStockData(ticker)
    //   stock[0].ticker = ticker
    //   stock[0].general = stockData.general
    //   stock[0].fundamentals = stockData.fundamentals
    //   await stock[0].save()
    // } catch (err) { }
    // res.status(200).json(stock[0])
  }


}

async function fetchStockData(ticker) {
  const stockData = {
    ticker: '',
    general: {},
    fundamentals: {},
    priceAction: [],
    dividendsData: {
      everyOne: {},
      yearly: {},
    },
    buybacks: {
      quarterly: {},
      yearly: {},
    },
    secFilings: {
      '10-K': {},
      '8-K': {},
      '10-Q': {},
      allFilings: {}
    },
    competition: {}
  }

  let dividends_array

  await fetch(`https://eodhistoricaldata.com/api/fundamentals/${ticker}.US?api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      stockData.general = res.General
      stockData.ticker = res.General.Code

      stockData.fundamentals.highlights = res.Highlights
      stockData.fundamentals.valuation = res.Valuation
      stockData.fundamentals.sharesStats = res.SharesStats
      stockData.fundamentals.technicals = res.Technicals
      stockData.fundamentals.splitsDividends = res.SplitsDividends
      stockData.fundamentals.analystRatings = res.AnalystRatings
      stockData.fundamentals.holders = res.Holders
      stockData.fundamentals.insiderTransactions = res.InsiderTransactions
      stockData.fundamentals.esgScores = res.ESGScores
      stockData.fundamentals.outstandingShares = res.outstandingShares
      stockData.fundamentals.earnings = res.Earnings
      stockData.fundamentals.financialStatements = res.Financials
    })


  var currentDate = new Date();

  // Get the current date
  const year = currentDate.getFullYear(); // e.g., 2023
  const month = currentDate.getMonth() + 1; // months are zero-based, so add 1 (e.g., 7 for July)
  const day = currentDate.getDate(); // e.g., 13

  // Create a formatted string for the current date
  var formattedCurrentDate = year + '-' + month + '-' + day;
  var formattedOldDate = (year - 25) + '-' + month + '-' + day;

  await fetch(`https://eodhistoricaldata.com/api/eod/${ticker}.US?from=${formattedOldDate}&to=${formattedCurrentDate}&period=d&fmt=json&&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      stockData.priceAction = res

    })

  await fetch(`https://eodhistoricaldata.com/api/insider-transactions?code=${ticker}&from=${formattedOldDate}&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      Object.keys(stockData.fundamentals.insiderTransactions).forEach(period => {
        stockData.fundamentals.insiderTransactions[period] = res[period];

        ['code', 'exchange', 'reportDate', 'ownerCik', 'ownerRelationship', 'transactionAcquiredDisposed', 'link'].forEach(metric => {
          delete stockData.fundamentals.insiderTransactions[period][metric]
        })

        switch (stockData.fundamentals.insiderTransactions[period].transactionCode) {
          case 'S':
            stockData.fundamentals.insiderTransactions[period].transactionCode = 'Sale'
            break;

          case 'P':
            stockData.fundamentals.insiderTransactions[period].transactionCode = 'Purchase'
            break;

          default:
            break;
        }

        function splitNumberEvery3Digits(number) {
          // Convert the number to a string

          if (!number) return '-'

          let numStr = number.toString();
          let formattedString = ''
          let result = ''

          numStr.split('').reverse().forEach((digit, index) => {
            formattedString = formattedString + digit
            if ((index + 1) % 3 == 0) {
              formattedString = formattedString + ' '
            }
          })

          formattedString.split('').reverse().forEach(digit => {
            result = result + digit
          })


          return result;
        }




        stockData.fundamentals.insiderTransactions[period].transactionType = stockData.fundamentals.insiderTransactions[period].transactionCode
        delete stockData.fundamentals.insiderTransactions[period].transactionCode

        stockData.fundamentals.insiderTransactions[period].quantity = stockData.fundamentals.insiderTransactions[period].transactionAmount
        delete stockData.fundamentals.insiderTransactions[period].transactionAmount

        stockData.fundamentals.insiderTransactions[period].price = stockData.fundamentals.insiderTransactions[period].transactionPrice
        delete stockData.fundamentals.insiderTransactions[period].transactionPrice

        stockData.fundamentals.insiderTransactions[period].value = stockData.fundamentals.insiderTransactions[period].postTransactionAmount
        delete stockData.fundamentals.insiderTransactions[period].postTransactionAmount

        stockData.fundamentals.insiderTransactions[period].price = `$${stockData.fundamentals.insiderTransactions[period].price}`

        stockData.fundamentals.insiderTransactions[period].date = formatDate(stockData.fundamentals.insiderTransactions[period].date)
        stockData.fundamentals.insiderTransactions[period].transactionDate = formatDate(stockData.fundamentals.insiderTransactions[period].transactionDate)


        if (stockData.fundamentals.insiderTransactions[period].transactionType == 'Sale') {
          stockData.fundamentals.insiderTransactions[period].quantity = `-${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].quantity)}`
          stockData.fundamentals.insiderTransactions[period].value = `-${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].value)}`
        } else {
          stockData.fundamentals.insiderTransactions[period].quantity = `${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].quantity)}`
          stockData.fundamentals.insiderTransactions[period].value = `${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].value)}`
        }

      })
    })

  await fetch(`https://eodhistoricaldata.com/api/div/${ticker}.US?fmt=json&&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      dividends_array = res
      dividends_array.reverse().forEach(period => {
        stockData.dividendsData.everyOne[period.date] = {
          exDate: period.date,
          declarationDate: period.declarationDate,
          recordDate: period.recordDate,
          paymentDate: period.paymentDate,
          frequency: period.period,
          valueAdjusted: period.value,
          valueUnadjusted: period.unadjustedValue,
          currency: period.currency,
        }
      })
      const getYearFromDateString = (dateString) => {
        return new Date(dateString).getFullYear();
      };

      // Create a new object to store the annualized data
      const annualizedData = {};

      // Loop through the dataArray and calculate the annualized values
      dividends_array.forEach((data) => {
        const year = getYearFromDateString(data.date);

        if (!annualizedData[year]) {
          annualizedData[year] = {
            year,
            totalValue: 0,
            totalUnadjustedValue: 0,
            currency: data.currency,
          };
        }

        annualizedData[year].totalValue += data.value;
        annualizedData[year].totalUnadjustedValue += data.unadjustedValue;
      });

      // Convert the annualizedData object into an array
      let annualizedDataArray = Object.values(annualizedData);

      annualizedDataArray.forEach(period => {
        if (period.year >= new Date().getFullYear()) return
        stockData.dividendsData.yearly[`${period.year}`] = {
          year: period.year,
          dividendsPerShare: period.totalValue
        }
      })

    })

  function addLeadingZeros(inputStr) {

    // Calculate the number of leading zeros needed
    const numOfZeros = 10 - inputStr.length;

    // If the input string is already longer than 10 characters, return it as is
    if (numOfZeros <= 0) {
      return inputStr;
    }

    // Pad the input string with leading zeros
    const paddedStr = '0'.repeat(numOfZeros) + inputStr;
    return paddedStr;
  }
  if (stockData.general.CIK) {
    await fetch(`https://data.sec.gov/submissions/CIK${addLeadingZeros(stockData.general.CIK)}.json`)
      .then(response => response.json())
      .then(response => {

        response.filings.recent.primaryDocDescription.forEach((desc, index) => {
          if (desc == '10-K' || desc == '10-Q' || desc == '8-K') {
            const accessionNumber = `${response.filings.recent.accessionNumber[index].split('-')[0]}${response.filings.recent.accessionNumber[index].split('-')[1]}${response.filings.recent.accessionNumber[index].split('-')[2]}`
            const reportDate = `${response.filings.recent.reportDate[index].split('-')[0]}${response.filings.recent.reportDate[index].split('-')[1]}${response.filings.recent.reportDate[index].split('-')[2]}`
            stockData.secFilings[desc][Object.keys(stockData.secFilings[desc]).length] = {
              accessionNumber: accessionNumber,
              date: formatDate(response.filings.recent.reportDate[index]),
              reportDate: reportDate,
              type: desc,
              secLink: `https://www.sec.gov/ix?doc=/Archives/edgar/data/${stockData.general.CIK}/${accessionNumber}/${ticker.toLowerCase()}-${reportDate}.htm`
            }
            stockData.secFilings.allFilings[Object.keys(stockData.secFilings.allFilings).length] = {
              accessionNumber: accessionNumber,
              date: formatDate(response.filings.recent.reportDate[index]),
              reportDate: reportDate,
              type: desc,
              secLink: `https://www.sec.gov/ix?doc=/Archives/edgar/data/${stockData.general.CIK}/${accessionNumber}/${ticker.toLowerCase()}-${reportDate}.htm`
            }
          }
        })
      })
  }

  //console.log(stockData.general)

  if (!stockData.fundamentals.financialStatements || !stockData.general.Sector || !stockData.general.FullTimeEmployees) {
    return 'error'
  }

  // Competition


  await postCompetitors(stockData)


  Object.keys(stockData.fundamentals.holders.Institutions).forEach(period => {
    stockData.fundamentals.holders.Institutions[period].shares = formatNumber(Number(stockData.fundamentals.holders.Institutions[period].currentShares))
    stockData.fundamentals.holders.Institutions[period].rank = Number(period) + 1
    stockData.fundamentals.holders.Institutions[period].institution = stockData.fundamentals.holders.Institutions[period].name
    stockData.fundamentals.holders.Institutions[period].ownership = `${stockData.fundamentals.holders.Institutions[period].totalShares.toFixed(2)}%`

  })
  Object.keys(stockData.fundamentals.holders.Funds).forEach(period => {
    stockData.fundamentals.holders.Funds[period].shares = formatNumber(Number(stockData.fundamentals.holders.Funds[period].currentShares))
    stockData.fundamentals.holders.Funds[period].rank = Number(period) + 1
    stockData.fundamentals.holders.Funds[period].fund = stockData.fundamentals.holders.Funds[period].name
    stockData.fundamentals.holders.Funds[period].ownership = `${stockData.fundamentals.holders.Funds[period].totalShares.toFixed(2)}%`



  })

  stockData.fundamentals.financialStatements.Statistics = {
    yearly: {},
    quarterly: {},
  }


  const yearlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.yearly);
  const quarterlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.quarterly);

  for (const [index, [key, report]] of Array.from(yearlyEntries.entries())) {
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);
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
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);
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
      returnOnAssets: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalAssets,
      returnOnEquity: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalStockholderEquity,
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


  const priceAction = stockData.priceAction;
  const quarterlyStatistics = stockData.fundamentals.financialStatements.Statistics.quarterly;

  const quarterlyIncomeStatement = stockData.fundamentals.financialStatements.Income_Statement.quarterly;

  const quarterlyBalanceSheet = stockData.fundamentals.financialStatements.Balance_Sheet.quarterly;

  const quarterlyCashflowStatement = stockData.fundamentals.financialStatements.Cash_Flow.quarterly;
  const periods = Object.keys(quarterlyStatistics).reverse();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  stockData.fundamentals.dcf = {
    tenYears: {},
    fiveYears: {},
    oneYear: {},
  }

  for (let i = 0; i < periods.length; i++) {
    const fundamentalPeriod = periods[i];
    const [fundamentalYear, fundamentalMonth, fundamentalDay] = fundamentalPeriod.split('-');
    let fundamentalMonthNew = Number(fundamentalMonth) + 3;
    let endDate;

    if (fundamentalMonthNew > 12) {
      endDate = new Date(Number(fundamentalYear) + 1, fundamentalMonthNew - 12, fundamentalDay);
    } else {
      endDate = new Date(fundamentalYear, fundamentalMonthNew, fundamentalDay);
    }

    if (i === periods.length - 1) {
      endDate = currentDate;
    }

    const startDate = new Date(fundamentalYear, fundamentalMonth - 1, fundamentalDay);



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

      }
    }

    for (let j = 0; j < Object.keys(stockData.dividendsData.yearly).length; j++) {
      const dividendsPeriod = stockData.dividendsData.yearly[Object.keys(stockData.dividendsData.yearly)[j]];

      const dividendsYear = dividendsPeriod.year;

      if (dividendsYear == fundamentalYear && fundamentalMonth == 12) {
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

        dividendsPeriod.totalDividendsPaid = addTMM(quarterlyCashflowStatement, 'dividendsPaid')
        dividendsPeriod.freeCashflow = addTMM(quarterlyCashflowStatement, 'freeCashFlow')
        dividendsPeriod.dividendsYield = dividendsPeriod.dividendsPerShare / average_Price(dividendsYear)
        dividendsPeriod.payoutRatio = dividendsPeriod.totalDividendsPaid / addTMM(quarterlyIncomeStatement, 'netIncome')

      }
    }


    if (i == periods.length - 1) {
      function TTM(statement, metric, yearsAgo) {
        try {
          return Number(statement[periods[i - (0 + (4 * yearsAgo))]][metric]) +
            Number(statement[periods[i - (1 + (4 * yearsAgo))]][metric]) +
            Number(statement[periods[i - (2 + (4 * yearsAgo))]][metric]) +
            Number(statement[periods[i - (3 + (4 * yearsAgo))]][metric])
        } catch (error) {

          return Number(statement[periods[i]][metric]) +
            Number(statement[periods[i]][metric]) +
            Number(statement[periods[i]][metric]) +
            Number(statement[periods[i]][metric])
        }

      }

      function average(statement, metric, years) {
        let result = 0
        for (let y = 1; y <= years; y++) {

          result = result + (TTM(statement, metric, y - 1) / 4)
        }
        return result / years
      }

      function average_Multiple(statement, metric, years) {
        const allMultiples = []
        const currentDate = new Date()
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

      let ten_years = 10
      let five_years = 5
      if (Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length < 40) {
        ten_years = Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length / 4 - 1
      }
      if (Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length < 20) {
        five_years = Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length / 4 - 1
      }

      stockData.fundamentals.dcf.growth = {
        tenYears: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0) / TTM(quarterlyIncomeStatement, 'totalRevenue', ten_years)) ** (1 / ten_years)) - 1) * 100,
        fiveYears: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0) / TTM(quarterlyIncomeStatement, 'totalRevenue', five_years)) ** (1 / five_years)) - 1) * 100,
        oneYear: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0) / TTM(quarterlyIncomeStatement, 'totalRevenue', 1)) ** (1 / 1)) - 1) * 100,
      }

      stockData.fundamentals.dcf.profitMargin = {
        tenYears: average(quarterlyStatistics, 'netMargin', ten_years),
        fiveYears: average(quarterlyStatistics, 'netMargin', five_years),
        oneYear: average(quarterlyStatistics, 'netMargin', 1),
      }

      stockData.fundamentals.dcf.freeCashflowMargin = {
        tenYears: average(quarterlyStatistics, 'freeCashflowMargin', ten_years),
        fiveYears: average(quarterlyStatistics, 'freeCashflowMargin', five_years),
        oneYear: average(quarterlyStatistics, 'freeCashflowMargin', 1),
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
  }

  stockData.competition['0'] = {
    ticker: stockData.ticker,
    name: stockData.general.Name,
    marketCap: formatNumber(stockData.fundamentals.highlights.MarketCapitalization),
    sharePrice: `$${stockData.priceAction[stockData.priceAction.length - 1].adjusted_close.toFixed(1)}`,
    growth: `${(stockData.fundamentals.dcf.growth.fiveYears).toFixed(2)}%`,
    trailingPE: stockData.fundamentals.valuation.TrailingPE.toFixed(1),
    forwardPE: stockData.fundamentals.valuation.ForwardPE.toFixed(1),
    PS: stockData.fundamentals.valuation.PriceSalesTTM.toFixed(1),
    dividendsYield: stockData.fundamentals.highlights.DividendYield ? formatPrecentage(stockData.fundamentals.highlights.DividendYield) : '-',
    netMargin: formatPrecentage(stockData.fundamentals.dcf.profitMargin.oneYear),
    ROE: formatPrecentage(stockData.fundamentals.highlights.ReturnOnEquityTTM),
    precentShort: formatPrecentage(stockData.fundamentals.technicals.ShortPercent),
  }

  return (stockData)

}

function formatDate(dateString) {
  try {
    // Parse the input date string into a Date object
    const dateObj = new Date(dateString);

    // Define an array of month names
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct", "Novr", "Dec"
    ];

    // Get the month, day, and year from the Date object
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    // Format the result as 'Month Day, Year' (e.g., 'January 17, 2022')
    const formattedDate = `${month} ${day}, ${year}`;
    return formattedDate;

  } catch (error) {
    // Handle invalid date format
    return "Invalid date format. Please provide the date in 'YYYY-MM-DD' format.";
  }
}

function formatNumber(num, extraInfo) {
  if (extraInfo == 'change' && typeof num == 'number') {
    return `${((num * 100)?.toFixed(2))}%`
  }
  if (!num) {
    if (extraInfo == 'change') {
      return ''
    }
    return '---'
  }

  if (extraInfo == 'precentage') {
    return `${((num * 100)?.toFixed(2))}%`
  }

  if (extraInfo == 'whole') {
    return `${(num.toFixed(2))}`
  }

  if (Math.abs(num) >= 1000000000000) {
    return (num / 1000000000000).toFixed(1) + 'T'
  } else if (Math.abs(num) >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    try {
      return num.toFixed(2);
    } catch (error) {
      return num
    }
  }
}

function formatPrecentage(num) {

  if (num > 10 && num < 100) {
    num = num / 100
  }

  return `${(num * 100).toFixed(2)}%`
}


async function postCompetitors(stockData) {
  const competitiors = await Stock.find({ 'general.Industry': stockData.general.Industry }, {
    ticker: 1,
    'general': 1,
    'fundamentals.highlights': 1,
    'fundamentals.valuation': 1,
    'fundamentals.technicals': 1,
    'fundamentals.splitsDividends': 1,
    'fundamentals.esgScores': 1,
    'fundamentals.dcf': 1,
    'priceAction': 1,
  })

  competitiors.forEach(competitior => {
    if (competitior.ticker != stockData.ticker) {
      stockData.competition[competitior.ticker] = {
        ticker: competitior.ticker,
        name: competitior.general.Name,
        marketCap: formatNumber(competitior.fundamentals.highlights.MarketCapitalization),
        sharePrice: `$${competitior.priceAction[competitior.priceAction.length - 1].adjusted_close.toFixed(1)}`,
        growth: `${(competitior.fundamentals.dcf.growth.fiveYears).toFixed(2)}%`,
        trailingPE: competitior.fundamentals.valuation.TrailingPE.toFixed(1),
        forwardPE: competitior.fundamentals.valuation.ForwardPE.toFixed(1),
        PS: competitior.fundamentals.valuation.PriceSalesTTM.toFixed(1),
        dividendsYield: competitior.fundamentals.highlights.DividendYield ? formatPrecentage(competitior.fundamentals.highlights.DividendYield) : '-',
        netMargin: formatPrecentage(competitior.fundamentals.dcf.profitMargin.oneYear),
        ROE: formatPrecentage(competitior.fundamentals.highlights.ReturnOnEquityTTM),
        precentShort: formatPrecentage(competitior.fundamentals.technicals.ShortPercent),
      }
    }

  })
}