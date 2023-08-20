import mongoose from 'mongoose'
import Stock from '../models/stock.js'
import fetchFundamentals from './stockDataParts/fetchFundamentals.js'
import fetchPriceAction from './stockDataParts/fetchPriceAction.js'
import fetchInsider from './stockDataParts/fetchInsider.js'
import fetchDividends from './stockDataParts/fetchDividends.js'
import fetchCIKFilings from './stockDataParts/fetchCIKFilings.js'
import formatHolders from './stockDataParts/formatHolders.js'
import formatStatements from './stockDataParts/formatStatements.js'
import addPriceActionMetrics from './stockDataParts/addPriceActionMetrics.js'
import addDividends from './stockDataParts/addDividends.js'
import { TTM, average, average_Multiple, yearlyGain, yearlyAverage, streak, payoff, sharePriceGain } from './stockDataParts/lastPeriodFunctions.js'
import addDCF from './stockDataParts/addDCF.js'
import addScreenerData from './stockDataParts/addScreenerData.js'


export const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}, { ticker: 1, 'general.Name': 1, screenerData: 1 })

    res.status(200).json(stocks.filter(stock => stock?.general))

  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const getSectorsandIndustries = async (req, res) => {
  const sectors = await Stock.find({}, { 'general.Sector': 1 });
  const industies = await Stock.find({}, { 'general.Industry': 1 });


  // Extract sector values from the documents
  const sectorValues = sectors.map(stock => stock.general?.Sector);
  const industryValues = industies.map(stock => stock.general?.Industry);
  // Get unique sectors using a Set
  const uniqueSectorsSet = new Set(sectorValues);
  const uniqueIndustiesSet = new Set(industryValues);

  // Convert Set back to an array
  const uniqueSectorsArray = [...uniqueSectorsSet];
  const uniqueIndustiesArray = [...uniqueIndustiesSet];
  res.status(200).json({ sectors: uniqueSectorsArray.filter(sector => sector), industies: uniqueIndustiesArray.filter(industry => industry) })
}

export const getStock = async (req, res) => {
  const ticker = req.params.id.toUpperCase()
  const stock = await Stock.find({ ticker: ticker })

  if (!stock.length || stock[0]?.general == undefined) {
    if (stock[0]?.general == undefined) {
      // console.log(ticker)
      // console.log(ticker)
    }
    let stockData
    try {
      stockData = await fetchStockData(ticker)

    }
    catch (err) {
      console.log(err)
    }

    if (stockData == 'error') {
      res.status(200).json({ message: 'Stock not enough data' })
    }
    const newStockData = new Stock({
      ticker: stockData.ticker,
      general: stockData.general,
      fundamentals: stockData.fundamentals,
      priceAction: stockData.priceAction,
      dividendsData: stockData.dividendsData,
      buybacks: stockData.buybacks,
      secFilings: stockData.secFilings,
      competition: stockData.competition,
      screenerData: stockData.screenerData,
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
    try {
      await postCompetitors(stock[0])

      await stock[0].save()
    } catch (err) {
      console.log(err)
    }

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
    dividendsData: {
      everyOne: {},
      yearly: {},
    },
    buybacks: {
      quarterly: {},
      yearly: {},
    },
    secFilings: {
      '10-K': {},
      '8-K': {},
      '10-Q': {},
      allFilings: {}
    },
    competition: {},
    screenerData: {},

  }

  let dividends_array

  await fetchFundamentals(ticker, stockData)

  var currentDate = new Date();

  // Get the current date
  const year = currentDate.getFullYear(); // e.g., 2023
  const month = currentDate.getMonth() + 1; // months are zero-based, so add 1 (e.g., 7 for July)
  const day = currentDate.getDate(); // e.g., 13

  // Create a formatted string for the current date
  var formattedCurrentDate = year + '-' + month + '-' + day;
  var formattedOldDate = (year - 25) + '-' + month + '-' + day;

  await fetchPriceAction(ticker, stockData, formattedOldDate, formattedCurrentDate)

  await fetchInsider(ticker, stockData, formattedOldDate)

  await fetchDividends(ticker, stockData, dividends_array)

  await fetchCIKFilings(ticker, stockData)

  if (!stockData.fundamentals.financialStatements || !stockData.general.Sector || !stockData.general.FullTimeEmployees) {
    return 'error'
  }

  await postCompetitors(stockData)

  formatHolders(stockData)

  formatStatements(stockData)



  const priceAction = stockData.priceAction;
  const quarterlyStatistics = stockData.fundamentals.financialStatements.Statistics.quarterly;

  const quarterlyIncomeStatement = stockData.fundamentals.financialStatements.Income_Statement.quarterly;

  const quarterlyBalanceSheet = stockData.fundamentals.financialStatements.Balance_Sheet.quarterly;

  const quarterlyCashflowStatement = stockData.fundamentals.financialStatements.Cash_Flow.quarterly;
  const periods = Object.keys(quarterlyStatistics).reverse();

  // const currentYear = currentDate.getFullYear();
  // const currentMonth = currentDate.getMonth() + 1;
  // const currentDay = currentDate.getDate();

  stockData.fundamentals.dcf = {
    tenYears: {},
    fiveYears: {},
    oneYear: {},
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------
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


    addPriceActionMetrics(i, periods, priceAction, startDate, endDate, fundamentalPeriod, quarterlyIncomeStatement, quarterlyBalanceSheet, quarterlyCashflowStatement, quarterlyStatistics);

    addDividends(stockData, i, periods, fundamentalYear, fundamentalMonth, quarterlyCashflowStatement, quarterlyIncomeStatement)

    //-------------------------------------------------------------------------------------------------------------------------------------------------------

    if (i == periods.length - 1) {

      let ten_years = 10
      let five_years = 5
      let three_years = 3

      if (Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length < 40) {
        ten_years = Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length / 4 - 1
      }
      if (Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length < 20) {
        five_years = Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length / 4 - 1
      }

      if (Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length < 22) {
        three_years = Object.keys(stockData.fundamentals.financialStatements.Income_Statement.quarterly).length / 4 - 1
      }

      addDCF(stockData, TTM, average, average_Multiple, five_years, ten_years, periods, i, quarterlyIncomeStatement, quarterlyStatistics)

      await addScreenerData(
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
      )
      //-------------------------------------------------------------------------------------------------------------------------------------------------------

      Object.keys(stockData.fundamentals.financialStatements).forEach(statement => {
        if (statement == 'Income_Statement' || statement == 'Cash_Flow') {
          stockData.fundamentals.financialStatements[statement].yearly.TTM = {}
          stockData.fundamentals.financialStatements[statement].quarterly.TTM = {}
          Object.keys(stockData.fundamentals.financialStatements[statement].yearly[Object.keys(stockData.fundamentals.financialStatements[statement].yearly)[0]]).forEach(metric => {
            stockData.fundamentals.financialStatements[statement].yearly.TTM[metric] = TTM(stockData.fundamentals.financialStatements[statement].quarterly, metric, 0, periods, i)
            stockData.fundamentals.financialStatements[statement].quarterly.TTM[metric] = TTM(stockData.fundamentals.financialStatements[statement].quarterly, metric, 0, periods, i)
            stockData.fundamentals.financialStatements[statement].yearly.TTM.date = 'TTM'
            stockData.fundamentals.financialStatements[statement].quarterly.TTM.date = 'TTM'
          })
        } else if (statement == 'Statistics') {
          stockData.fundamentals.financialStatements[statement].yearly.Current = {}
          stockData.fundamentals.financialStatements[statement].quarterly.Current = {}
          Object.keys(stockData.fundamentals.financialStatements[statement].yearly[Object.keys(stockData.fundamentals.financialStatements[statement].yearly)[0]]).forEach(metric => {
            stockData.fundamentals.financialStatements[statement].yearly.Current[metric] = stockData.fundamentals.financialStatements[statement].quarterly[Object.keys(stockData.fundamentals.financialStatements[statement].quarterly)[0]][metric]
            stockData.fundamentals.financialStatements[statement].quarterly.Current[metric] = stockData.fundamentals.financialStatements[statement].quarterly[Object.keys(stockData.fundamentals.financialStatements[statement].quarterly)[0]][metric]
            stockData.fundamentals.financialStatements[statement].yearly.Current.date = 'Current'
            stockData.fundamentals.financialStatements[statement].quarterly.Current.date = 'Current'
          })
        }

      })
      //-------------------------------------------------------------------------------------------------------------------------------------------------------

    }


  }
  //-------------------------------------------------------------------------------------------------------------------------------------------------------

  stockData.competition['0'] = {
    ticker: stockData.ticker,
    name: stockData.general.Name,
    marketCap: formatNumber(stockData.fundamentals.highlights.MarketCapitalization),
    sharePrice: `$${stockData.priceAction[stockData.priceAction.length - 1].adjusted_close.toFixed(1)}`,
    growth: `${(stockData.fundamentals.dcf.growth.fiveYears).toFixed(2)}%`,
    trailingPE: stockData.fundamentals.valuation.TrailingPE.toFixed(1),
    forwardPE: stockData.fundamentals.valuation.ForwardPE.toFixed(1),
    PS: stockData.fundamentals.valuation.PriceSalesTTM.toFixed(1),
    dividendsYield: stockData.fundamentals.highlights.DividendYield ? formatPrecentage(stockData.fundamentals.highlights.DividendYield) : '-',
    netMargin: formatPrecentage(stockData.fundamentals.dcf.profitMargin.oneYear),
    ROE: formatPrecentage(stockData.fundamentals.highlights.ReturnOnEquityTTM),
    precentShort: formatPrecentage(stockData.fundamentals.technicals.ShortPercent),
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------------------


  return (stockData)

}


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

function formatPrecentage(num) {

  if (num > 10 && num < 100) {
    num = num / 100
  }

  return `${(num * 100).toFixed(2)}%`
}


async function postCompetitors(stockData) {
  const competitiors = await Stock.find({ 'general.Industry': stockData.general.Industry }, {
    ticker: 1,
    'general': 1,
    'fundamentals.highlights': 1,
    'fundamentals.valuation': 1,
    'fundamentals.technicals': 1,
    'fundamentals.splitsDividends': 1,
    'fundamentals.esgScores': 1,
    'fundamentals.dcf': 1,
    'priceAction': 1,
  })

  competitiors.forEach(competitior => {
    if (competitior.ticker != stockData.ticker) {
      stockData.competition[competitior.ticker] = {
        ticker: competitior.ticker,
        name: competitior.general.Name,
        marketCap: formatNumber(competitior.fundamentals.highlights.MarketCapitalization),
        sharePrice: `$${competitior.priceAction[competitior.priceAction.length - 1].adjusted_close.toFixed(1)}`,
        growth: `${(competitior.fundamentals.dcf.growth.fiveYears).toFixed(2)}%`,
        trailingPE: competitior.fundamentals.valuation.TrailingPE.toFixed(1),
        forwardPE: competitior.fundamentals.valuation.ForwardPE.toFixed(1),
        PS: competitior.fundamentals.valuation.PriceSalesTTM.toFixed(1),
        dividendsYield: competitior.fundamentals.highlights.DividendYield ? formatPrecentage(competitior.fundamentals.highlights.DividendYield) : '-',
        netMargin: formatPrecentage(competitior.fundamentals.dcf.profitMargin.oneYear),
        ROE: formatPrecentage(competitior.fundamentals.highlights.ReturnOnEquityTTM),
        precentShort: formatPrecentage(competitior.fundamentals.technicals.ShortPercent),
      }
    }

  })
}