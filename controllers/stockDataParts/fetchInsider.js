
export default async function fetchInsider(ticker, stockData, formattedOldDate) {
  await fetch(`https://eodhistoricaldata.com/api/insider-transactions?code=${ticker}&from=${formattedOldDate}&api_token=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(res => {
      Object.keys(stockData.fundamentals.insiderTransactions).forEach(period => {
        stockData.fundamentals.insiderTransactions[period] = res[period];

        ['code', 'exchange', 'reportDate', 'ownerCik', 'ownerRelationship', 'transactionAcquiredDisposed', 'link'].forEach(metric => {
          delete stockData.fundamentals.insiderTransactions[period][metric]
        })

        switch (stockData.fundamentals.insiderTransactions[period].transactionCode) {
          case 'S':
            stockData.fundamentals.insiderTransactions[period].transactionCode = 'Sale'
            break;

          case 'P':
            stockData.fundamentals.insiderTransactions[period].transactionCode = 'Purchase'
            break;

          default:
            break;
        }

        function formatDate(dateString) {
          try {
            // Parse the input date string into a Date object
            const dateObj = new Date(dateString);

            // Define an array of month names
            const months = [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
              "Aug", "Sep", "Oct", "Novr", "Dec"
            ];

            // Get the month, day, and year from the Date object
            const month = months[dateObj.getMonth()];
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();

            // Format the result as 'Month Day, Year' (e.g., 'January 17, 2022')
            const formattedDate = `${month} ${day}, ${year}`;
            return formattedDate;

          } catch (error) {
            // Handle invalid date format
            return "Invalid date format. Please provide the date in 'YYYY-MM-DD' format.";
          }
        }

        function splitNumberEvery3Digits(number) {
          // Convert the number to a string

          if (!number) return '-'

          let numStr = number.toString();
          let formattedString = ''
          let result = ''

          numStr.split('').reverse().forEach((digit, index) => {
            formattedString = formattedString + digit
            if ((index + 1) % 3 == 0) {
              formattedString = formattedString + ' '
            }
          })

          formattedString.split('').reverse().forEach(digit => {
            result = result + digit
          })


          return result;
        }




        stockData.fundamentals.insiderTransactions[period].transactionType = stockData.fundamentals.insiderTransactions[period].transactionCode
        delete stockData.fundamentals.insiderTransactions[period].transactionCode

        stockData.fundamentals.insiderTransactions[period].quantity = stockData.fundamentals.insiderTransactions[period].transactionAmount
        delete stockData.fundamentals.insiderTransactions[period].transactionAmount

        stockData.fundamentals.insiderTransactions[period].price = stockData.fundamentals.insiderTransactions[period].transactionPrice
        delete stockData.fundamentals.insiderTransactions[period].transactionPrice

        stockData.fundamentals.insiderTransactions[period].value = stockData.fundamentals.insiderTransactions[period].postTransactionAmount
        delete stockData.fundamentals.insiderTransactions[period].postTransactionAmount

        stockData.fundamentals.insiderTransactions[period].price = `$${stockData.fundamentals.insiderTransactions[period].price}`

        stockData.fundamentals.insiderTransactions[period].date = formatDate(stockData.fundamentals.insiderTransactions[period].date)
        stockData.fundamentals.insiderTransactions[period].transactionDate = formatDate(stockData.fundamentals.insiderTransactions[period].transactionDate)


        if (stockData.fundamentals.insiderTransactions[period].transactionType == 'Sale') {
          stockData.fundamentals.insiderTransactions[period].quantity = `-${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].quantity)}`
          stockData.fundamentals.insiderTransactions[period].value = `-${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].value)}`
        } else {
          stockData.fundamentals.insiderTransactions[period].quantity = `${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].quantity)}`
          stockData.fundamentals.insiderTransactions[period].value = `${splitNumberEvery3Digits(stockData.fundamentals.insiderTransactions[period].value)}`
        }

      })
    })
}