import Stock from '../models/stock.js'

export const dcf = async (req, res) => {
  const { bull, neutral, bear } = req.body.formData
  const ticker = req.body.ticker
  const years = req.body.years
  const stock = await Stock.findOne({ ticker: ticker })

  const currentRevenue = stock.fundamentals.highlights.RevenueTTM
  const sharesOutstanding = stock.fundamentals.sharesStats.SharesOutstanding


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
  bearCase.marketCap = (earnings + freeCashflows) / 2
  bearCase.stockPrice = bearCase.marketCap / sharesOutstanding
  bearCase.futureStockPrice = bearCase.stockPrice * (1 + (Number(bear.desiredAnnualReturn) / 100)) ** years
  bearCase.currentStockPrice = stock.priceAction[stock.priceAction.length - 1].adjusted_close
  bearCase.MOSstockPrice = bearCase.stockPrice * (bear.marginOfsafety / 100)
  bearCase.CAGR = (((bearCase.futureStockPrice / bearCase.currentStockPrice) ** (1 / years)) - 1) * 100


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
  neutralCase.marketCap = (earnings + freeCashflows) / 2
  neutralCase.stockPrice = neutralCase.marketCap / sharesOutstanding
  neutralCase.futureStockPrice = neutralCase.stockPrice * (1 + (Number(neutral.desiredAnnualReturn) / 100)) ** years
  neutralCase.currentStockPrice = stock.priceAction[stock.priceAction.length - 1].adjusted_close
  neutralCase.MOSstockPrice = neutralCase.stockPrice * (neutral.marginOfsafety / 100)
  neutralCase.CAGR = (((neutralCase.futureStockPrice / neutralCase.currentStockPrice) ** (1 / years)) - 1) * 100

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
  bullCase.marketCap = (earnings + freeCashflows) / 2
  bullCase.stockPrice = bullCase.marketCap / sharesOutstanding
  bullCase.futureStockPrice = bullCase.stockPrice * (1 + (Number(bull.desiredAnnualReturn) / 100)) ** years
  bullCase.currentStockPrice = stock.priceAction[stock.priceAction.length - 1].adjusted_close
  bullCase.MOSstockPrice = bullCase.stockPrice * (bull.marginOfsafety / 100)
  bullCase.CAGR = (((bullCase.futureStockPrice / bullCase.currentStockPrice) ** (1 / years)) - 1) * 100


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