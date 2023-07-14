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
      res.status(404).json({ message: err.message })
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
    priceAction: [],
    technicals: []
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



  stockData.fundamentals.financialStatements.Statistics = {
    yearly: {},
    quarterly: {},
  }


  const yearlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.yearly);
  const quarterlyEntries = Object.entries(stockData.fundamentals.financialStatements.Income_Statement.quarterly);

  for (const [index, [key, report]] of Array.from(yearlyEntries.entries())) {
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);

    stockData.fundamentals.financialStatements.Statistics.yearly[report.date] = {
      sharesOutstanding: stockData.fundamentals.outstandingShares.annual[index].shares,
      grossMargin: Number(report.grossProfit) / Number(report.totalRevenue),
      operatingMargin: Number(report.operatingIncome) / Number(report.totalRevenue),
      netMargin: Number(report.netIncome) / Number(report.totalRevenue),
      returnOnAssets: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key].totalAssets,
      returnOnEquity: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key].totalStockholderEquity,
      currentRatio: stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key].totalCurrentAssets / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key].totalCurrentLiabilities,
      quickRatio: stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key].cashAndEquivalents / stockData.fundamentals.financialStatements.Balance_Sheet.yearly[key].totalCurrentLiabilities,
    };
  }

  for (const [index, [key, report]] of Array.from(quarterlyEntries.entries())) {
    report.otherCostOfRevenue = Number(report.costOfRevenue) - Number(report.depreciationAndAmortization);

    stockData.fundamentals.financialStatements.Statistics.quarterly[report.date] = {
      date: report.date,
      filing_date: report.filing_date,
      sharesOutstanding: stockData.fundamentals.outstandingShares.quarterly[index].shares,
      grossMargin: Number(report.grossProfit) / Number(report.totalRevenue),
      operatingMargin: Number(report.operatingIncome) / Number(report.totalRevenue),
      netMargin: Number(report.netIncome) / Number(report.totalRevenue),
      returnOnAssets: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key].totalAssets,
      returnOnEquity: Number(report.netIncome) / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key].totalStockholderEquity,
      currentRatio: stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key].totalCurrentAssets / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key].totalCurrentLiabilities,
      quickRatio: stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key].cashAndEquivalents / stockData.fundamentals.financialStatements.Balance_Sheet.quarterly[key].totalCurrentLiabilities,
    };
  }


  Object.keys(stockData.fundamentals.financialStatements.Statistics.quarterly).forEach(fundamentalPeriod => {
    const fundamentalYear = fundamentalPeriod.split('-')[0]
    const fundamentalMonth = fundamentalPeriod.split('-')[1]
    const fundamentalMonthNew = Number(fundamentalPeriod.split('-')[1]) + 3
    const fundamentalDay = fundamentalPeriod.split('-')[2]
    stockData.priceAction.forEach(pricePeriod => {
      if (new Date(pricePeriod.date).getTime() >= new Date(`${fundamentalYear}-${fundamentalMonth}-${fundamentalDay}`).getTime() ||
        new Date(pricePeriod.date).getTime() <= new Date(`${fundamentalYear}-${fundamentalMonthNew}-${fundamentalDay}`).getTime()
      ) {
        pricePeriod.marketCap = stockData.fundamentals.financialStatements.Statistics.quarterly[fundamentalPeriod].sharesOutstanding * pricePeriod.adjusted_close
        // stockData.technicals.push({

        // })
      }
    })
  })




  return (stockData)

}
