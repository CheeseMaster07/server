export default async function fetchDividends(ticker, stockData, dividends_array) {
  await fetch(`https://eodhistoricaldata.com/api/div/${ticker}.US?fmt=json&&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      dividends_array = res
      dividends_array.reverse().forEach(period => {
        stockData.dividendsData.everyOne[period.date] = {
          exDate: period.date,
          declarationDate: period.declarationDate,
          recordDate: period.recordDate,
          paymentDate: period.paymentDate,
          frequency: period.period,
          valueAdjusted: period.value,
          valueUnadjusted: period.unadjustedValue,
          currency: period.currency,
        }
      })
      const getYearFromDateString = (dateString) => {
        return new Date(dateString).getFullYear();
      };

      // Create a new object to store the annualized data
      const annualizedData = {};

      // Loop through the dataArray and calculate the annualized values
      dividends_array.forEach((data) => {
        const year = getYearFromDateString(data.date);

        if (!annualizedData[year]) {
          annualizedData[year] = {
            year,
            totalValue: 0,
            totalUnadjustedValue: 0,
            currency: data.currency,
          };
        }

        annualizedData[year].totalValue += data.value;
        annualizedData[year].totalUnadjustedValue += data.unadjustedValue;
      });

      // Convert the annualizedData object into an array
      let annualizedDataArray = Object.values(annualizedData);

      annualizedDataArray.forEach(period => {
        if (period.year >= new Date().getFullYear()) return
        stockData.dividendsData.yearly[`${period.year}`] = {
          year: period.year,
          dividendsPerShare: period.totalValue
        }
      })

    })
}