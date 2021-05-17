const baseUrl = "https://finance.yahoo.com/quote/";

interface HistoricalDataPoint {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose: number;
}

/**
 * @param {number} startMonth
 * @param {number} startDay
 * @param {number} startYear
 * @param {number} endMonth
 * @param {number} endDay
 * @param {number} endYear
 * @param {string} ticker
 * @param {('1d','1wk','1mo')} frequency
 * @param {Function} [callback]
 *
 * @return {Promise<{date: number, open: number, high:number, low:number, close:number, volume:number, adjclose:number}[]>|undefined} Returns a promise if no callback was supplied.
 */
export const getHistoricalPrices = async function (
  startMonth: number, // An integer from 0 to 11
  startDay: number, // An integer from 1 and 31
  startYear: number, // A full year
  endMonth: number,
  endDay: number,
  endYear: number,
  ticker: string, // The stock ticker symbol
  frequency: "1d" | "1wk" | "1mo",
  callback?: (err: Error | null, prices?: [HistoricalDataPoint]) => void, // TODO: fix this callback--actually implement it.
) {
  const startDate = Math.floor(
    Date.UTC(startYear, startMonth, startDay, 0, 0, 0) / 1000,
  );
  const endDate = Math.floor(
    Date.UTC(endYear, endMonth, endDay, 0, 0, 0) / 1000,
  );

  const response = await fetch(
    `${
      baseUrl + ticker
    }/history?period1=${startDate}&period2=${endDate}&interval=${frequency}&filter=history&frequency=${frequency}`,
  );

  if (!response.ok) {
    throw new Error("Not OK!");
  }

  const body = await response.text();

  try {
    const prices: [HistoricalDataPoint] = JSON.parse(
      body.split('HistoricalPriceStore":{"prices":')[1].split(',"isPending')[0],
    );

    if (callback) {
      callback(null, prices);
    } else {
      return prices;
    }
  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }
};

/**
 * @param {string} ticker
 *
 * @return {Promise<{price: number, currency: string}>}
 */
const getCurrentData = function (ticker: string) {
  // the Promise generic type corresponds to the non-error result
  return new Promise<{ price: number; currency: string | null }>(
    (resolve, reject) => {
      return fetch(`${baseUrl + ticker}/`)
        .then((response) => response.text())
        .then((body) => {
          try {
            let priceBeforeNumber = body
              .split(`"${ticker}":{"sourceInterval"`)[1]
              .split("regularMarketPrice")[1]
              .split('fmt":"')[1]
              .split('"')[0];

            let price: number = parseFloat(priceBeforeNumber.replace(",", ""));

            const currencyMatch = body.match(/Currency in ([A-Za-z]{3})/);
            let currency = null;
            if (currencyMatch) {
              currency = currencyMatch[1];
            }

            resolve({
              price,
              currency,
            });
          } catch (err) {
            reject(err);
          }
        });
    },
  );
};

/**
 * @param {string} ticker
 * @param {Function} [callback]
 *
 * @return {Promise<number>|undefined} Returns a promise if no callback was supplied.
 */
export const getCurrentPrice = function (
  ticker: string,
  callback?: (err: Error | null, price?: number) => void,
) {
  if (callback) {
    getCurrentData(ticker)
      .then((data) => callback(null, data.price))
      .catch((err) => callback(err));
  } else {
    return getCurrentData(ticker).then((data) => data.price);
  }
};
