export default async function fetchFundamentals(ticker, stockData) {
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
}