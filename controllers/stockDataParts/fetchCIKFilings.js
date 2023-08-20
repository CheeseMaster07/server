export default async function fetchCIKFilings(ticker, stockData) {
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
  function addLeadingZeros(inputStr) {

    // Calculate the number of leading zeros needed
    const numOfZeros = 10 - inputStr.length;

    // If the input string is already longer than 10 characters, return it as is
    if (numOfZeros <= 0) {
      return inputStr;
    }

    // Pad the input string with leading zeros
    const paddedStr = '0'.repeat(numOfZeros) + inputStr;
    return paddedStr
  }
  if (stockData.general.CIK) {
    await fetch(`https://data.sec.gov/submissions/CIK${addLeadingZeros(stockData.general.CIK)}.json`)
      .then(response => response.json())
      .then(response => {

        response.filings.recent.primaryDocDescription.forEach((desc, index) => {
          if (desc == '10-K' || desc == '10-Q' || desc == '8-K') {
            const accessionNumber = `${response.filings.recent.accessionNumber[index].split('-')[0]}${response.filings.recent.accessionNumber[index].split('-')[1]}${response.filings.recent.accessionNumber[index].split('-')[2]}`
            const reportDate = `${response.filings.recent.reportDate[index].split('-')[0]}${response.filings.recent.reportDate[index].split('-')[1]}${response.filings.recent.reportDate[index].split('-')[2]}`
            stockData.secFilings[desc][Object.keys(stockData.secFilings[desc]).length] = {
              accessionNumber: accessionNumber,
              date: formatDate(response.filings.recent.reportDate[index]),
              reportDate: reportDate,
              type: desc,
              secLink: `https://www.sec.gov/ix?doc=/Archives/edgar/data/${stockData.general.CIK}/${accessionNumber}/${ticker.toLowerCase()}-${reportDate}.htm`
            }
            stockData.secFilings.allFilings[Object.keys(stockData.secFilings.allFilings).length] = {
              accessionNumber: accessionNumber,
              date: formatDate(response.filings.recent.reportDate[index]),
              reportDate: reportDate,
              type: desc,
              secLink: `https://www.sec.gov/ix?doc=/Archives/edgar/data/${stockData.general.CIK}/${accessionNumber}/${ticker.toLowerCase()}-${reportDate}.htm`
            }
          }
        })
      })
  }
}