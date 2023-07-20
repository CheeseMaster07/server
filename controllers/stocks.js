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
      priceAction: stockData.priceAction
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
    priceAction: []
  }

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
  var year = currentDate.getFullYear(); // e.g., 2023
  var month = currentDate.getMonth() + 1; // months are zero-based, so add 1 (e.g., 7 for July)
  var day = currentDate.getDate(); // e.g., 13

  // Create a formatted string for the current date
  var formattedCurrentDate = year + '-' + month + '-' + day;
  var formattedOldDate = (year - 25) + '-' + month + '-' + day;

  await fetch(`https://eodhistoricaldata.com/api/eod/${ticker}.US?from=${formattedOldDate}&to=${formattedCurrentDate}&period=d&fmt=json&&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      stockData.priceAction = res

    })

  if (!stockData.fundamentals.financialStatements) {
    return 'error'
  }

  stockData.fundamentals.financialStatements.Statistics = {
    yearly: {},
    quarterly: {},
  }


  const yearlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.yearly);
  const quarterlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.quarterly);

  for (const [index, [key, report]] of Array.from(yearlyEntries.entries())) {
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);

    stockData.fundamentals.financialStatements.Statistics.yearly[report.date] = {
      sharesOutstanding: stockData.fundamentals.outstandingShares.annual[index]?.shares,
      grossMargin: Number(report.grossProfit) / Number(report.totalRevenue),
      operatingMargin: Number(report.operatingIncome) / Number(report.totalRevenue),
      netMargin: Number(report.netIncome) / Number(report.totalRevenue),
      returnOnAssets: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalAssets,
      returnOnEquity: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalStockholderEquity,
      currentRatio: stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalCurrentAssets / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalCurrentLiabilities,
      quickRatio: stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.cashAndEquivalents / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key]?.totalCurrentLiabilities,
    };
  }

  for (const [index, [key, report]] of Array.from(quarterlyEntries.entries())) {
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);

    stockData.fundamentals.financialStatements.Statistics.quarterly[report.date] = {
      date: report.date,
      filing_date: report.filing_date,
      sharesOutstanding: stockData.fundamentals.outstandingShares.quarterly[index]?.shares,
      grossMargin: Number(report.grossProfit) / Number(report?.totalRevenue),
      operatingMargin: Number(report.operatingIncome) / Number(report?.totalRevenue),
      netMargin: Number(report.netIncome) / Number(report?.totalRevenue),
      returnOnAssets: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalAssets,
      returnOnEquity: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalStockholderEquity,
      currentRatio: stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalCurrentAssets / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalCurrentLiabilities,
      quickRatio: stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.cashAndEquivalents / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key]?.totalCurrentLiabilities,
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
    stockData.fundamentals.Dcf.tenYears = {

    }
    stockData.fundamentals.Dcf.fiveYears = {

    }

    stockData.fundamentals.Dcf.oneYear = {

    }


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
  }

  return (stockData)

}
