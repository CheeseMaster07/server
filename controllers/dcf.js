import Stock from '../models/stock.js'

export const dcf = async (req, res) => {
  const { bull, neutral, bear } = req.body.formData
  const ticker = req.body.ticker
  const years = req.body.years
  const stock = await Stock.findOne({ ticker: ticker })

  const currentRevenue = stock.fundamentals.highlights.RevenueTTM
  const currentNetDebt = Number(stock.fundamentals.financialStatements.Balance_Sheet.quarterly[Object.keys(stock.fundamentals.financialStatements.Balance_Sheet.quarterly)[0]].netDebt)
  const sharesOutstanding = stock.fundamentals.sharesStats.SharesOutstanding
  const currentStockPrice = stock.priceAction[stock.priceAction.length - 1].adjusted_close

  // Bear case
  const bearCase = {}
  let earnings = 0
  let freeCashflows = 0

  for (let i = 1; i <= years; i++) {
    const earningsInPeriod = (currentRevenue * (Number(bear.profitMargin) / 100)) * (1 + (Number(bear.growthRate) / 100)) ** i
    const freeCashflowInPeriod = (currentRevenue * (Number(bear.freeCashflowMargin) / 100)) * (1 + (Number(bear.growthRate) / 100)) ** i

    const discountedEarnings = earningsInPeriod / ((1 + (Number(bear.desiredAnnualReturn) / 100)) ** i)
    const discountedFreeCashflow = freeCashflowInPeriod / ((1 + (Number(bear.desiredAnnualReturn) / 100)) ** i)

    earnings = earnings + discountedEarnings
    freeCashflows = freeCashflows + discountedFreeCashflow

    if (i == years) {
      earnings = earnings + discountedEarnings * Number(bear.earningsMultiple)
      freeCashflows = freeCashflows + discountedEarnings * Number(bear.freeCashflowMultiple)
    }
  }
  bearCase.marketCap = ((earnings + freeCashflows) / 2) - currentNetDebt
  bearCase.stockPrice = bearCase.marketCap / sharesOutstanding
  bearCase.upsideDownside = ((bearCase.stockPrice - currentStockPrice) / currentStockPrice) * 100
  bearCase.futureStockPrice = bearCase.stockPrice * (1 + (Number(bear.desiredAnnualReturn) / 100)) ** years
  bearCase.futureMarketCap = bearCase.futureStockPrice * sharesOutstanding
  bearCase.futureRevenue = currentRevenue * (1 + (Number(bear.growthRate) / 100)) ** years
  bearCase.futureNetIncome = bearCase.futureRevenue * (Number(bear.profitMargin) / 100)
  bearCase.MOSstockPrice = bearCase.stockPrice * (bear.marginOfsafety / 100)
  bearCase.bagger = bearCase.futureStockPrice / currentStockPrice
  bearCase.CAGR = (((bearCase.futureStockPrice / currentStockPrice) ** (1 / years)) - 1) * 100


  // Neutral Case
  const neutralCase = {}
  earnings = 0
  freeCashflows = 0

  for (let i = 1; i <= years; i++) {
    const earningsInPeriod = (currentRevenue * (Number(neutral.profitMargin) / 100)) * (1 + (Number(neutral.growthRate) / 100)) ** i
    const freeCashflowInPeriod = (currentRevenue * (Number(neutral.freeCashflowMargin) / 100)) * (1 + (Number(neutral.growthRate) / 100)) ** i

    const discountedEarnings = earningsInPeriod / ((1 + (Number(neutral.desiredAnnualReturn) / 100)) ** i)
    const discountedFreeCashflow = freeCashflowInPeriod / ((1 + (Number(neutral.desiredAnnualReturn) / 100)) ** i)

    earnings = earnings + discountedEarnings
    freeCashflows = freeCashflows + discountedFreeCashflow

    if (i == years) {
      earnings = earnings + discountedEarnings * Number(neutral.earningsMultiple)
      freeCashflows = freeCashflows + discountedEarnings * Number(neutral.freeCashflowMultiple)
    }
  }
  neutralCase.marketCap = ((earnings + freeCashflows) / 2) - currentNetDebt
  neutralCase.stockPrice = neutralCase.marketCap / sharesOutstanding
  neutralCase.upsideDownside = ((neutralCase.stockPrice - currentStockPrice) / currentStockPrice) * 100
  neutralCase.futureStockPrice = neutralCase.stockPrice * (1 + (Number(neutral.desiredAnnualReturn) / 100)) ** years
  neutralCase.futureMarketCap = neutralCase.futureStockPrice * sharesOutstanding
  neutralCase.futureRevenue = currentRevenue * (1 + (Number(neutral.growthRate) / 100)) ** years
  neutralCase.futureNetIncome = neutralCase.futureRevenue * (Number(neutral.profitMargin) / 100)
  neutralCase.MOSstockPrice = neutralCase.stockPrice * (neutral.marginOfsafety / 100)
  neutralCase.bagger = neutralCase.futureStockPrice / currentStockPrice
  neutralCase.CAGR = (((neutralCase.futureStockPrice / currentStockPrice) ** (1 / years)) - 1) * 100

  // Bull Case
  const bullCase = {}
  earnings = 0
  freeCashflows = 0

  for (let i = 1; i <= years; i++) {
    const earningsInPeriod = (currentRevenue * (Number(bull.profitMargin) / 100)) * (1 + (Number(bull.growthRate) / 100)) ** i
    const freeCashflowInPeriod = (currentRevenue * (Number(bull.freeCashflowMargin) / 100)) * (1 + (Number(bull.growthRate) / 100)) ** i

    const discountedEarnings = earningsInPeriod / ((1 + (Number(bull.desiredAnnualReturn) / 100)) ** i)
    const discountedFreeCashflow = freeCashflowInPeriod / ((1 + (Number(bull.desiredAnnualReturn) / 100)) ** i)

    earnings = earnings + discountedEarnings
    freeCashflows = freeCashflows + discountedFreeCashflow

    if (i == years) {
      earnings = earnings + discountedEarnings * Number(bull.earningsMultiple)
      freeCashflows = freeCashflows + discountedEarnings * Number(bull.freeCashflowMultiple)
    }
  }
  bullCase.marketCap = ((earnings + freeCashflows) / 2) - currentNetDebt
  bullCase.stockPrice = bullCase.marketCap / sharesOutstanding
  bullCase.upsideDownside = ((bullCase.stockPrice - currentStockPrice) / currentStockPrice) * 100
  bullCase.futureStockPrice = bullCase.stockPrice * (1 + (Number(bull.desiredAnnualReturn) / 100)) ** years
  bullCase.futureMarketCap = bullCase.futureStockPrice * sharesOutstanding
  bullCase.futureRevenue = currentRevenue * (1 + (Number(bull.growthRate) / 100)) ** years
  bullCase.futureNetIncome = bullCase.futureRevenue * (Number(bull.profitMargin) / 100)
  bullCase.MOSstockPrice = bullCase.stockPrice * (bull.marginOfsafety / 100)
  bullCase.bagger = bullCase.futureStockPrice / currentStockPrice
  bullCase.CAGR = (((bullCase.futureStockPrice / currentStockPrice) ** (1 / years)) - 1) * 100


  try {
    res.status(200).json({
      bearCase: bearCase,
      neutralCase: neutralCase,
      bullCase: bullCase
    })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}