export default function formatHolders(stockData) {
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
}