import Stock from '../models/stock.js'

export const dcf = async (req, res) => {
  const { growthRate, profitMargin, freeCashflowMargin, earningsMultiple, freeCashflowMultiple, desiredAnnualReturn, marginOfsafety } = req.body.formData
  const ticker = req.body.ticker
  const years = req.body.years
  const stock = await Stock.findOne({ ticker: ticker })

  let earnings = 0
  let freeCashflows = 0
  const currentRevenue = stock.fundamentals.highlights.RevenueTTM
  const sharesOutstanding = stock.fundamentals.sharesStats.SharesOutstanding

  for (let i = 1; i <= years; i++) {
    const earningsInPeriod = (currentRevenue * (Number(profitMargin) / 100)) * (1 + (Number(growthRate) / 100)) ** i
    const freeCashflowInPeriod = (currentRevenue * (Number(freeCashflowMargin) / 100)) * (1 + (Number(growthRate) / 100)) ** i

    const discountedEarnings = earningsInPeriod / ((1 + (Number(desiredAnnualReturn) / 100)) ** i)
    const discountedFreeCashflow = freeCashflowInPeriod / ((1 + (Number(desiredAnnualReturn) / 100)) ** i)

    earnings = earnings + discountedEarnings
    freeCashflows = freeCashflows + discountedFreeCashflow

    if (i == years) {
      earnings = earnings + discountedEarnings * Number(earningsMultiple)
      freeCashflows = freeCashflows + discountedEarnings * Number(freeCashflowMultiple)
      console.log(discountedEarnings * Number(earningsMultiple) / sharesOutstanding)
    }
  }
  const marketCap = (earnings + freeCashflows) / 2
  const stockPrice = marketCap / sharesOutstanding
  const futureStockPrice = stockPrice * (1 + (Number(desiredAnnualReturn) / 100)) ** years
  const currentStockPrice = stock.priceAction[stock.priceAction.length - 1].adjusted_close
  const MOSstockPrice = stockPrice * (marginOfsafety / 100)
  const CAGR = (((futureStockPrice / currentStockPrice) ** (1 / years)) - 1) * 100

  try {
    res.status(200).json({
      stockPrice: stockPrice,
      MOSstockPrice: MOSstockPrice,
      currentStockPrice: currentStockPrice,
      futureStockPrice: futureStockPrice,
      CAGR: CAGR
    })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}