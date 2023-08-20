export default async function addScreenerData(
  stockData,
  periods,
  i,
  average_Multiple,
  TTM,
  yearlyGain,
  yearlyAverage,
  average,
  payoff,
  streak,
  sharePriceGain,
  three_years,
  five_years,
  ten_years,
  quarterlyIncomeStatement,
  quarterlyBalanceSheet,
  quarterlyCashflowStatement,
  quarterlyStatistics,
) {
  stockData.screenerData = {
    general: {
      sector: {
        'Current': stockData.general.Sector,
      },
      industry: {
        'Current': stockData.general.Industry,
      }
    },
    valuation: {
      marketCap: {
        Latest: stockData.fundamentals.highlights.MarketCapitalization,
      },
      priceEarnings: {
        '10 Years': stockData.fundamentals.dcf.earningsMultiple.tenYears,
        '5 Years': stockData.fundamentals.dcf.earningsMultiple.fiveYears,
        '3 Years': average_Multiple(stockData.priceAction, 'priceEarnings', three_years),
        Trailing: stockData.fundamentals.valuation.TrailingPE,
        Forward: stockData.fundamentals.valuation.ForwardPE,
      },
      enterpriceValueEBIT: {
        '10 Years': average_Multiple(stockData.priceAction, 'enterpriceValueEbit', ten_years),
        '5 Years': average_Multiple(stockData.priceAction, 'enterpriceValueEbit', five_years),
        '3 Years': average_Multiple(stockData.priceAction, 'enterpriceValueEbit', three_years),
        Trailing: stockData.priceAction[stockData.priceAction.length - 1].enterpriceValueEbit,
      },
      priceBook: {
        '10 Years': average_Multiple(stockData.priceAction, 'priceBook', ten_years),
        '5 Years': average_Multiple(stockData.priceAction, 'priceBook', five_years),
        '3 Years': average_Multiple(stockData.priceAction, 'priceBook', three_years),
        Trailing: stockData.priceAction[stockData.priceAction.length - 1].priceBook,
      },
      priceSales: {
        '10 Years': average_Multiple(stockData.priceAction, 'priceSales', ten_years),
        '5 Years': average_Multiple(stockData.priceAction, 'priceSales', five_years),
        '3 Years': average_Multiple(stockData.priceAction, 'priceSales', three_years),
        Trailing: stockData.priceAction[stockData.priceAction.length - 1].priceSales,
        Forward: stockData.fundamentals.highlights.MarketCapitalization / Number(stockData.fundamentals.earnings.Trend[Object.keys(stockData.fundamentals.earnings.Trend)[0]]?.revenueEstimateAvg),
      },
      priceFreeCashflow: {
        '10 Years': stockData.fundamentals.dcf.freeCashflowMultiple.tenYears,
        '5 Years': stockData.fundamentals.dcf.freeCashflowMultiple.fiveYears,
        '3 Years': average_Multiple(stockData.priceAction, 'priceFreeCashflow', three_years),
        Trailing: stockData.priceAction[stockData.priceAction.length - 1].priceFreeCashflow,
      },
    },
    growth: {
      revenueGrowth: {
        '10 Years': {
          CAGR: stockData.fundamentals.dcf.growth.tenYears,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) - TTM(quarterlyIncomeStatement, 'totalRevenue', ten_years, periods, i)) / TTM(quarterlyIncomeStatement, 'totalRevenue', ten_years, periods, i)) * 100
        },
        '5 Years': {
          CAGR: stockData.fundamentals.dcf.growth.fiveYears,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) - TTM(quarterlyIncomeStatement, 'totalRevenue', five_years, periods, i)) / TTM(quarterlyIncomeStatement, 'totalRevenue', five_years, periods, i)) * 100
        },
        '3 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) / TTM(quarterlyIncomeStatement, 'totalRevenue', three_years, periods, i)) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'totalRevenue', 0, periods, i) - TTM(quarterlyIncomeStatement, 'totalRevenue', three_years, periods, i)) / TTM(quarterlyIncomeStatement, 'totalRevenue', three_years, periods, i)) * 100
        },
        TTM: stockData.fundamentals.dcf.growth.oneYear,
        Forward: Number(stockData.fundamentals.earnings.Trend[Object.keys(stockData.fundamentals.earnings.Trend)[0]]?.revenueEstimateGrowth),
      },
      operatingIncomeGrowth: {
        '10 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'operatingIncome', ten_years, periods, i)) ** (1 / ten_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) - TTM(quarterlyIncomeStatement, 'operatingIncome', ten_years, periods, i)) / TTM(quarterlyIncomeStatement, 'operatingIncome', ten_years, periods, i)) * 100
        },
        '5 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'operatingIncome', five_years, periods, i)) ** (1 / five_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) - TTM(quarterlyIncomeStatement, 'operatingIncome', five_years, periods, i)) / TTM(quarterlyIncomeStatement, 'operatingIncome', five_years, periods, i)) * 100
        },
        '3 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'operatingIncome', three_years, periods, i)) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) - TTM(quarterlyIncomeStatement, 'operatingIncome', three_years, periods, i)) / TTM(quarterlyIncomeStatement, 'operatingIncome', three_years, periods, i)) * 100
        },
        TTM: (((TTM(quarterlyIncomeStatement, 'operatingIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'operatingIncome', 1, periods, i)) ** (1 / 1)) - 1) * 100,
      },
      netIncomeGrowth: {
        '10 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'netIncome', ten_years, periods, i)) ** (1 / ten_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) - TTM(quarterlyIncomeStatement, 'netIncome', ten_years, periods, i)) / TTM(quarterlyIncomeStatement, 'netIncome', ten_years, periods, i)) * 100
        },
        '5 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'netIncome', five_years, periods, i)) ** (1 / five_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) - TTM(quarterlyIncomeStatement, 'netIncome', five_years, periods, i)) / TTM(quarterlyIncomeStatement, 'netIncome', five_years, periods, i)) * 100
        },
        '3 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'netIncome', three_years, periods, i)) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) - TTM(quarterlyIncomeStatement, 'netIncome', three_years, periods, i)) / TTM(quarterlyIncomeStatement, 'netIncome', three_years, periods, i)) * 100
        },
        TTM: (((TTM(quarterlyIncomeStatement, 'netIncome', 0, periods, i) / TTM(quarterlyIncomeStatement, 'netIncome', 1, periods, i)) ** (1 / 1)) - 1) * 100,
      },
      EPSGrowth: {
        '10 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) / TTM(quarterlyIncomeStatement, 'EPS', ten_years, periods, i)) ** (1 / ten_years)) - 1, periods, i) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) - TTM(quarterlyIncomeStatement, 'EPS', ten_years, periods, i)) / TTM(quarterlyIncomeStatement, 'EPS', ten_years, periods, i)) * 100
        },
        '5 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) / TTM(quarterlyIncomeStatement, 'EPS', five_years, periods, i)) ** (1 / five_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) - TTM(quarterlyIncomeStatement, 'EPS', five_years, periods, i)) / TTM(quarterlyIncomeStatement, 'EPS', five_years, periods, i)) * 100
        },
        '3 Years': {
          CAGR: (((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) / TTM(quarterlyIncomeStatement, 'EPS', three_years, periods, i)) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) - TTM(quarterlyIncomeStatement, 'EPS', three_years, periods, i)) / TTM(quarterlyIncomeStatement, 'EPS', three_years, periods, i)) * 100
        },
        TTM: (((TTM(quarterlyIncomeStatement, 'EPS', 0, periods, i) / TTM(quarterlyIncomeStatement, 'EPS', 1, periods, i)) ** (1 / 1)) - 1) * 100,
        //Forward: Number(stockData.fundamentals.earnings.Trend[Object.keys(stockData.fundamentals.earnings.Trend)[0]]?.revenueEstimateGrowth),
      },
    },
    dividends: {
      dividendsPerShare: {
        Latest: stockData.fundamentals.highlights.DividendShare,
        '1 Year': yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 1, 'cumulative'),
        '3 Years': {
          CAGR: yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 3, 'CAGR'),
          Cumulative: yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 3, 'cumulative'),
        },
        '5 Years': {
          CAGR: yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 5, 'CAGR'),
          Cumulative: yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 5, 'cumulative'),
        },
        '10 Years': {
          CAGR: yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 10, 'CAGR'),
          Cumulative: yearlyGain(stockData.dividendsData.yearly, 'dividendsPerShare', 10, 'cumulative'),
        },
      },
      dividendsYield: {
        Latest: stockData.fundamentals.highlights.DividendYield,
        Average: {
          '3 Years': yearlyAverage(stockData.dividendsData.yearly, 'dividendsYield', 1),
          '5 Years': yearlyAverage(stockData.dividendsData.yearly, 'dividendsYield', 5),
          '10 Years': yearlyAverage(stockData.dividendsData.yearly, 'dividendsYield', 10),
        }
      },
      payoutRatio: {
        Latest: stockData.dividendsData.yearly[Object.keys(stockData.dividendsData.yearly)[Object.keys(stockData.dividendsData.yearly).length - 1]]?.payoutRatio,
        Average: {
          '3 Years': yearlyAverage(stockData.dividendsData.yearly, 'payoutRatio', 1),
          '5 Years': yearlyAverage(stockData.dividendsData.yearly, 'payoutRatio', 5),
          '10 Years': yearlyAverage(stockData.dividendsData.yearly, 'payoutRatio', 10),
        }
      },
      dividendsStreak: {
        '# of Years': streak(stockData).dividends,
      }
    },
    buybacks: {
      sharesOutstanding: {
        Latest: stockData.buybacks.yearly[Object.keys(stockData.buybacks.yearly)[0]].sharesOutstanding,
        '1 Year': yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 1, 'cumulative', 'buybacks'),
        '3 Years': {
          CAGR: yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 3, 'CAGR', 'buybacks'),
          Cumulative: yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 3, 'cumulative', 'buybacks'),
        },
        '5 Years': {
          CAGR: yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 5, 'CAGR', 'buybacks'),
          Cumulative: yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 5, 'cumulative', 'buybacks'),
        },
        '10 Years': {
          CAGR: yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 10, 'CAGR', 'buybacks'),
          Cumulative: yearlyGain(stockData.buybacks.yearly, 'sharesOutstanding', 10, 'cumulative', 'buybacks'),
        },
      }
    },
    forecast: {

    },
    stability: {
      totalDebt: {
        Latest: quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal,
        '1 Year': ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal - quarterlyBalanceSheet[periods[i - (4 * 1)]]?.shortLongTermDebtTotal) / quarterlyBalanceSheet[periods[i - (4 * 1)]]?.shortLongTermDebtTotal) * 100,
        '3 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal / quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.shortLongTermDebtTotal) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal - quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.shortLongTermDebtTotal) / quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.shortLongTermDebtTotal) * 100,
        },
        '5 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal / quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.shortLongTermDebtTotal) ** (1 / five_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal - quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.shortLongTermDebtTotal) / quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.shortLongTermDebtTotal) * 100,
        },
        '10 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal / quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.shortLongTermDebtTotal) ** (1 / ten_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.shortLongTermDebtTotal - quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.shortLongTermDebtTotal) / quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.shortLongTermDebtTotal) * 100,
        },
      },
      cash: {
        Latest: quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash,
        '1 Year': ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash - quarterlyBalanceSheet[periods[i - (4 * 1)]]?.cash) / quarterlyBalanceSheet[periods[i - (4 * 1)]]?.cash) * 100,
        '3 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash / quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.cash) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash - quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.cash) / quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.cash) * 100,
        },
        '5 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash / quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.cash) ** (1 / five_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash - quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.cash) / quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.cash) * 100,
        },
        '10 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash / quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.cash) ** (1 / ten_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.cash - quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.cash) / quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.cash) * 100,
        },
      },
      netDebt: {
        Latest: quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt,
        '1 Year': ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt - quarterlyBalanceSheet[periods[i - (4 * 1)]]?.netDebt) / quarterlyBalanceSheet[periods[i - (4 * 1)]]?.netDebt) * 100,
        '3 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt / quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.netDebt) ** (1 / three_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt - quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.netDebt) / quarterlyBalanceSheet[periods[i - (4 * three_years)]]?.netDebt) * 100,
        },
        '5 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt / quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.netDebt) ** (1 / five_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt - quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.netDebt) / quarterlyBalanceSheet[periods[i - (4 * five_years)]]?.netDebt) * 100,
        },
        '10 Years': {
          CAGR: (((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt / quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.netDebt) ** (1 / ten_years)) - 1) * 100,
          Cumulative: ((quarterlyBalanceSheet[periods[i - (4 * 0)]]?.netDebt - quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.netDebt) / quarterlyBalanceSheet[periods[i - (4 * ten_years)]]?.netDebt) * 100,

        },
      },
      currentRatio: {
        '10 Years': average(quarterlyStatistics, 'currentRatio', ten_years, periods, i),
        '5 Years': average(quarterlyStatistics, 'currentRatio', five_years, periods, i),
        '3 Years': average(quarterlyStatistics, 'currentRatio', three_years, periods, i),
        Latest: average(quarterlyStatistics, 'currentRatio', 1, periods, i),
      },
      payoffTime: {
        '# of Years': {
          FCF: payoff(stockData, periods, i, quarterlyIncomeStatement, quarterlyCashflowStatement).freeCashflow,
          Profit: payoff(stockData, periods, i, quarterlyIncomeStatement, quarterlyCashflowStatement).netIncome,
        },
      }
    },
    profitability: {
      returnOnAssets: {
        '10 Years': average(quarterlyStatistics, 'returnOnAssets', ten_years, periods, i),
        '5 Years': average(quarterlyStatistics, 'returnOnAssets', five_years, periods, i),
        '3 Years': average(quarterlyStatistics, 'returnOnAssets', three_years, periods, i),
        TTM: average(quarterlyStatistics, 'returnOnAssets', 1, periods, i),
      },
      returnOnEquity: {
        '10 Years': average(quarterlyStatistics, 'returnOnEquity', ten_years, periods, i),
        '5 Years': average(quarterlyStatistics, 'returnOnEquity', five_years, periods, i),
        '3 Years': average(quarterlyStatistics, 'returnOnEquity', three_years, periods, i),
        TTM: average(quarterlyStatistics, 'returnOnEquity', 1, periods, i),
      },
      grossMargin: {
        '10 Years': average(quarterlyStatistics, 'grossMargin', ten_years, periods, i),
        '5 Years': average(quarterlyStatistics, 'grossMargin', five_years, periods, i),
        '3 Years': average(quarterlyStatistics, 'grossMargin', three_years, periods, i),
        TTM: average(quarterlyStatistics, 'grossMargin', 1, periods, i),
      },
      operatingMargin: {
        '10 Years': average(quarterlyStatistics, 'operatingMargin', ten_years, periods, i),
        '5 Years': average(quarterlyStatistics, 'operatingMargin', five_years, periods, i),
        '3 Years': average(quarterlyStatistics, 'operatingMargin', three_years, periods, i),
        TTM: average(quarterlyStatistics, 'operatingMargin', 1, periods, i),
      },
      profitMargin: {
        '10 Years': average(quarterlyStatistics, 'netMargin', ten_years, periods, i),
        '5 Years': average(quarterlyStatistics, 'netMargin', five_years, periods, i),
        '3 Years': average(quarterlyStatistics, 'netMargin', three_years, periods, i),
        TTM: average(quarterlyStatistics, 'netMargin', 1, periods, i),
      },
      profitable: {
        '# of Years': {
          FCF: streak(stockData).freeCashflow,
          Profit: streak(stockData).netIncome,
        },
      },
    },
    sharePrice: {
      sharePrice: {
        Latest: stockData.priceAction[stockData.priceAction.length - 1].adjusted_close,
        '1 day': sharePriceGain(stockData, 'cumulative', 'days', 1),
        '1 week': sharePriceGain(stockData, 'cumulative', 'weeks', 1),
        '1 month': sharePriceGain(stockData, 'cumulative', 'months', 1),
        YTD: sharePriceGain(stockData, 'cumulative', 'YTD', 0),
        '3 Years': {
          CAGR: sharePriceGain(stockData, 'CAGR', 'years', 3),
          Cumulative: sharePriceGain(stockData, 'cumulative', 'years', 3),
        },
        '5 Years': {
          CAGR: sharePriceGain(stockData, 'CAGR', 'years', 5),
          Cumulative: sharePriceGain(stockData, 'cumulative', 'years', 5),
        },
      },
    }

  }
}