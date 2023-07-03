import mongoose from 'mongoose'
import Stock from '../models/stock.js'

export const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}, { ticker: 1 })
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
    fundamentals: {}
  }

  await fetch(`https://eodhistoricaldata.com/api/fundamentals/${ticker}.US?api_token=6496a54766a737.91121265`)
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

  return (stockData)

}
