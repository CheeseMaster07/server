export default async function fetchPriceAction(ticker, stockData, formattedOldDate, formattedCurrentDate) {
  await fetch(`https://eodhistoricaldata.com/api/eod/${ticker}.US?from=${formattedOldDate}&to=${formattedCurrentDate}&period=d&fmt=json&&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      stockData.priceAction = res

    })
}