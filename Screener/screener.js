const fyers = require("fyers-api-v2");

fyers.setAppId("6FR49OXDIM-100");

const authToken = () => {
  fyers.setRedirectUrl(
    "https://trade.fyers.in/api-login/redirect-uri/index.html"
  );

  fyers.generateAuthCode();
};

const auth = async () => {
  const reqBody = {
    auth_code:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkubG9naW4uZnllcnMuaW4iLCJpYXQiOjE2OTMyMTQxNDUsImV4cCI6MTY5MzI0NDE0NSwibmJmIjoxNjkzMjEzNTQ1LCJhdWQiOiJbXCJ4OjBcIiwgXCJ4OjFcIiwgXCJ4OjJcIiwgXCJkOjFcIiwgXCJkOjJcIiwgXCJ4OjFcIiwgXCJ4OjBcIl0iLCJzdWIiOiJhdXRoX2NvZGUiLCJkaXNwbGF5X25hbWUiOiJYQTMwMjAyIiwib21zIjoiSzEiLCJoc21fa2V5IjoiZmQ3YWRjNjAzYWUxN2I2MzAzMTVhNmI4ODM1ZWU1MThiZDg1OTU5MjMwNDAyMzEwNzY0NDBmMjEiLCJub25jZSI6IiIsImFwcF9pZCI6IjZGUjQ5T1hESU0iLCJ1dWlkIjoiYjc4NzNhZjY4MmE2NGM5ZThlM2VkOTY1ZDQzMGUxODciLCJpcEFkZHIiOiIwLjAuMC4wIiwic2NvcGUiOiIifQ.FLhwyafBegdO997xQXEHtcgIVdizRUPId_91RqLPK7M",

    secret_key: "67C0VJ25RB",
  };

  fyers.generate_access_token(reqBody).then((response) => {
    console.log(response);
  });
};
const setToken = (token) => {
  fyers.setAccessToken(token);
};

const getProfile = () => {
  fyers.get_profile().then((response) => {
    console.log(response);
  });
};
async function getHistory(symbol, from, to) {
  let history = new fyers.history();
  let result = await history
    // .setSymbol("NSE:IEX-EQ")
    .setSymbol(symbol)
    .setResolution("D")
    .setDateFormat(0)
    // .setRangeFrom("1623548415")
    // .setRangeTo("1689212415")
    .setRangeFrom(from)
    .setRangeTo(to)
    .getHistory();
  console.log(result);
  return result;
}
async function getQuotes() {
  let quotes = new fyers.quotes();
  let result = await quotes.setSymbol("NSE:ONGC-EQ").getQuotes();
  console.log(result);
}
async function marketDepth() {
  let marketDepth1 = new fyers.marketDepth();
  let result = await marketDepth1
    .setSymbol("NSE:SBIN-EQ")
    .setOhlcvFlag(1)
    .getMarketDepth();
  console.log(JSON.stringify(result));
}
const getRealData = async () => {
  const reqBody = {
    symbol: ["NSE:ONGC-EQ", "NSE:IOC-EQ"],

    dataType: "symbolUpdate",
  };

  fyers.fyers_connect(reqBody, function (data) {
    console.log(data);
    //write your code here
  });
};
const unsubscribe = async () => {
  const reqBody = {
    symbol: ["NSE:ONGC-EQ", "NSE:IOC-EQ"],

    dataType: "symbolUpdate",
  };

  fyers.fyers_unsuscribe(reqBody);
};

function calculateEMA(data, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);

  // Calculate the initial SMA (Simple Moving Average)
  const sma =
    data.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  ema.push(sma);

  // Calculate the subsequent EMA values
  for (let i = period; i < data.length; i++) {
    const currentPrice = data[i];
    const prevEMA = ema[i - period];
    const currentEMA = (currentPrice - prevEMA) * multiplier + prevEMA;
    ema.push(currentEMA);
  }

  return ema;
}
function calculateSMA(data, period) {
  const sma = [];

  // Calculate the SMA values
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, value) => acc + value, 0);
    const average = sum / period;
    sma.push(average);
  }

  return sma;
}

const ema200 = async (result) => {
  // Extract closing prices from historical data
  //   const result = await getHistory("1657676415", "1689212415");
  const closingPrices = result.candles.map((candle) => candle[4]);

  // Calculate 200-day EMA
  const period = 200;
  const ema200 = calculateEMA(closingPrices, period);

  console.log("200-day EMA values:", ema200);
  return ema200;
};
const ema50 = async (result) => {
  // Extract closing prices from historical data
  //   const result = await getHistory("1657676415", "1689212415");
  const closingPrices = result.candles.map((candle) => candle[4]);

  // Calculate 200-day EMA
  const period = 50;
  const ema50 = calculateEMA(closingPrices, period);

  console.log("50-day EMA values:", ema50);
  return ema50;
};
const plotEma = async (symbol, from, to) => {
  const plotly = require("plotly.js");

  const result = await getHistory(symbol, from, to);
  const closingPrices = result.candles.map((candle) => candle[4]);

  // Calculate 50-day and 200-day EMAs
  const period50 = 50;
  const period200 = 200;

  const ema50 = calculateEMA(closingPrices, period50);
  const ema200 = calculateEMA(closingPrices, period200);

  // Generate x-axis values (dates)
  const timestamps = result.candles.map((candle) => candle[0]);
  const dates = timestamps.map((timestamp) => new Date(timestamp * 1000));

  const Plotly = require("plotly.js-node");

  // Create trace for 50-day EMA
  const traceEMA50 = {
    x: dates,
    y: ema50,
    mode: "lines",
    name: "50-day EMA",
  };

  // Create trace for 200-day EMA
  const traceEMA200 = {
    x: dates,
    y: ema200,
    mode: "lines",
    name: "200-day EMA",
  };

  // Create data array
  const data = [traceEMA50, traceEMA200];

  // Create layout for the chart
  const layout = {
    title: "EMA Plot",
    xaxis: {
      title: "Date",
    },
    yaxis: {
      title: "EMA Value",
    },
  };

  // Generate the chart
  Plotly.newPlot("ema_plot", data, layout)
    .then(() => {
      console.log("EMA plot generated successfully.");
    })
    .catch((error) => {
      console.error("Error generating plot:", error);
    });
};
const emaCrossOver = async (symbol, from, to) => {
  const result = await getHistory(symbol, from, to);

  const closingPrices = result.candles.map((candle) => candle[4]);
  const timestamps = result.candles.map((candle) => candle[0]);

  // Calculate 50-day and 200-day EMAs
  const period50 = 50;
  const period200 = 200;

  const ema50 = calculateEMA(closingPrices, period50);
  const ema200 = calculateEMA(closingPrices, period200);
  console.log("ema200,ema50", ema200, ema50);

  // Find crossover points with dates
  const crossoverPoints = [];

  for (let i = period200; i < closingPrices.length; i++) {
    const currentPrice = closingPrices[i];
    const prevPrice = closingPrices[i - 1];
    const currentEMA50 = ema50[i - period200];
    const prevEMA50 = ema50[i - period200 - 1];
    const currentEMA200 = ema200[i - period200];
    const prevEMA200 = ema200[i - period200 - 1];

    if (
      prevEMA50 < prevEMA200 &&
      currentEMA50 >= currentEMA200 &&
      prevPrice <= prevEMA50 &&
      currentPrice > currentEMA50
    ) {
      const crossoverDate = new Date(timestamps[i] * 1000); // Convert timestamp to date
      crossoverPoints.push({ date: crossoverDate, type: "bullish" });
    } else if (
      prevEMA50 > prevEMA200 &&
      currentEMA50 <= currentEMA200 &&
      prevPrice >= prevEMA50 &&
      currentPrice < currentEMA50
    ) {
      const crossoverDate = new Date(timestamps[i] * 1000); // Convert timestamp to date
      crossoverPoints.push({ date: crossoverDate, type: "bearish" });
    }
  }

  console.log("Crossover points:", crossoverPoints);
};
const smaCrossOver = async (symbol, from, to) => {
  const result = await getHistory(symbol, from, to);

  const closingPrices = result.candles.map((candle) => candle[4]);
  const timestamps = result.candles.map((candle) => candle[0]);

  // Calculate 50-day and 200-day EMAs
  const period50 = 50;
  const period200 = 200;

  const sma50 = calculateSMA(closingPrices, period50);
  const sma200 = calculateSMA(closingPrices, period200);

  // Find crossover points with dates
  const crossoverPoints = [];

  for (let i = period200; i < closingPrices.length; i++) {
    const currentPrice = closingPrices[i];
    const prevPrice = closingPrices[i - 1];
    const currentEMA50 = sma50[i - period200];
    const prevEMA50 = sma50[i - period200 - 1];
    const currentEMA200 = sma200[i - period200];
    const prevEMA200 = sma200[i - period200 - 1];

    if (
      prevEMA50 < prevEMA200 &&
      currentEMA50 >= currentEMA200 &&
      prevPrice <= prevEMA50 &&
      currentPrice > currentEMA50
    ) {
      const crossoverDate = new Date(timestamps[i] * 1000); // Convert timestamp to date
      crossoverPoints.push({ date: crossoverDate, type: "bullish" });
    } else if (
      prevEMA50 > prevEMA200 &&
      currentEMA50 <= currentEMA200 &&
      prevPrice >= prevEMA50 &&
      currentPrice < currentEMA50
    ) {
      const crossoverDate = new Date(timestamps[i] * 1000); // Convert timestamp to date
      crossoverPoints.push({ date: crossoverDate, type: "bearish" });
    }
  }

  console.log("Crossover points:", crossoverPoints);
};
////signal funs
function calculateATR(high, low, close, period) {
  const tr = [];
  for (let i = 0; i < close.length; i++) {
    const trueRange = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - close[i - 1]),
      Math.abs(low[i] - close[i - 1])
    );
    tr.push(trueRange);
  }
  const atr = [];
  for (let i = period; i < tr.length; i++) {
    const averageTrueRange =
      tr.slice(i - period, i).reduce((sum, value) => sum + value, 0) / period;
    atr.push(averageTrueRange);
  }
  return atr;
}

// Function to calculate Exponential Moving Average (EMA)
function calculateEMA(data, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);

  // Calculate the initial SMA (Simple Moving Average)
  const sma =
    data.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  ema.push(sma);

  // Calculate the subsequent EMA values
  for (let i = period; i < data.length; i++) {
    const currentPrice = data[i];
    const prevEMA = ema[i - period];
    const currentEMA = (currentPrice - prevEMA) * multiplier + prevEMA;
    ema.push(currentEMA);
  }

  return ema;
}

// Function to calculate Volume Weighted Moving Average (VWMA)
function calculateVWMA(close, volume, length) {
  const vwma = [];
  for (let i = length - 1; i < close.length; i++) {
    const sum = [];
    const volumeSum = [];
    for (let j = i - length + 1; j <= i; j++) {
      sum.push(close[j] * volume[j]);
      volumeSum.push(volume[j]);
    }
    const weightedSum = sum.reduce((total, value) => total + value, 0);
    const volumeTotal = volumeSum.reduce((total, value) => total + value, 0);
    const weightedAverage = weightedSum / volumeTotal;
    vwma.push(weightedAverage);
  }
  return vwma;
}

// Function to calculate Simple Moving Average (SMA)
function calculateSMA(data, period) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const average =
      data.slice(i - period + 1, i + 1).reduce((sum, value) => sum + value, 0) /
      period;
    sma.push(average);
  }
  return sma;
}

// Function to detect unusual volume spikes
function detectUnusualVolume(volume, volumeAverage, threshold) {
  const unusualVolume = [];
  for (let i = 0; i < volume.length; i++) {
    const isUnusual = volume[i] > volumeAverage[i] * threshold;
    unusualVolume.push(isUnusual);
  }
  return unusualVolume;
}
const signals = async (symbol, from, to) => {
  const result = await getHistory(symbol, from, to);

  const closingPrices = result.candles.map((candle) => candle[4]);
  const timestamps = result.candles.map((candle) => candle[0]);
  const high = result.candles.map((candle) => candle[2]);
  const low = result.candles.map((candle) => candle[3]);

  // Calculate 20-day ATR
  const atrPeriod = 20;
  const atrMultiplier = 4;
  const atr = calculateATR(high, low, closingPrices, atrPeriod);
  const nLoss = atrMultiplier * atr;

  // Calculate 20-day EMA
  const emaPeriod = 20;
  const ema = calculateEMA(closingPrices, emaPeriod);

  // Calculate VWMA
  const vwmaLength = 20;
  const volume = result.candles.map((candle) => candle[5]);
  const vwma = calculateVWMA(closingPrices, volume, vwmaLength);

  // Calculate 20-day SMA for volume
  const volSmaLength = 20;
  const volSma = calculateSMA(volume, volSmaLength);

  // Find crossover points with dates
  const crossoverPoints = [];

  let isLong = false;
  let isShort = false;

  for (let i = atrPeriod; i < closingPrices.length; i++) {
    const currentPrice = closingPrices[i];
    const prevPrice = closingPrices[i - 1];
    const prevEMA = ema[i - emaPeriod];
    const currentEMA = ema[i - emaPeriod + 1];
    const prevVolSma = volSma[i - volSmaLength];
    const currentVolSma = volSma[i - volSmaLength + 1];

    if (prevPrice < prevEMA && currentPrice > currentEMA && !isLong) {
      const crossoverDate = new Date(timestamps[i] * 1000); // Convert timestamp to date
      crossoverPoints.push({
        // symbol: symbol,
        date: crossoverDate,
        type: "buy",
      });
      isLong = true;
      isShort = false;
    } else if (prevPrice > prevEMA && currentPrice < currentEMA && !isShort) {
      const crossoverDate = new Date(timestamps[i] * 1000); // Convert timestamp to date
      crossoverPoints.push({
        // symbol: symbol,
        date: crossoverDate,
        type: "sell",
      });
      isLong = false;
      isShort = true;
    }
  }

  console.log("Crossover points:", crossoverPoints);
};
// Function to detect unusual volume spikes
function detectUnusualVolumeTS(volume, volumeAverage, threshold, timestamps) {
  const unusualVolume = [];
  for (let i = 0; i < volume.length; i++) {
    const isUnusual = volume[i] > volumeAverage[i] * threshold;
    if (isUnusual) {
      const timestamp = timestamps[i];
      const date = new Date(timestamp * 1000);
      unusualVolume.push({ date, isUnusual });
    }
  }
  return unusualVolume;
}

const unUsualVolume = async (symbol, from, to) => {
  const result = await getHistory(symbol, from, to);

  const volume = result.candles.map((candle) => candle[5]);
  const timestamps = result.candles.map((candle) => candle[0]);

  const volLength = 20;
  const volAvg = calculateSMA(volume, volLength);

  const unusualVolThreshold = 1.2;
  const unusualVol = detectUnusualVolumeTS(
    volume,
    volAvg,
    unusualVolThreshold,
    timestamps
  );

  console.log("Unusual volume spikes:", unusualVol);
};

const main = async () => {
  // authToken();
  // auth();
  setToken(
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2OTMyMTQxODAsImV4cCI6MTY5MzI2OTAyMCwibmJmIjoxNjkzMjE0MTgwLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCazdHWGtzRzlFdlBIbG8yTXg2cHJ2RTV2amZLTFl3OWJ4aXZTbk5nTmtMYTRSWlVKTU44UU1uM2U1WlhpaVp3eW9DSGJ4cWF4akJ6RWlXMExWYUJlSy1NTGFZRDBEdy1qVk9qNl8zQWE2bFBNd3RiUT0iLCJkaXNwbGF5X25hbWUiOiJBQkhJSklUSCBTVURIQUtBUkFOIiwib21zIjoiSzEiLCJoc21fa2V5IjoiZmQ3YWRjNjAzYWUxN2I2MzAzMTVhNmI4ODM1ZWU1MThiZDg1OTU5MjMwNDAyMzEwNzY0NDBmMjEiLCJmeV9pZCI6IlhBMzAyMDIiLCJhcHBUeXBlIjoxMDAsInBvYV9mbGFnIjoiTiJ9.J_5Fz4REghI6YBJb3wa4SSX1mIxwhZCBC4uWLOHSDCk"
  );
  //   emaCrossOver("NSE:INFY-EQ", "1657676415", "1689212415");
  //   smaCrossOver("NSE:ASIANPAINT-EQ", "1657676415", "1689212415");
  //   plotEma("NSE:EICHERMOT-EQ", "1657676415", "1689212415");

  signals("NSE:TATASTEEL-EQ", "1674897432", "1693214232");

  //   unUsualVolume("NSE:IEX-EQ", "1657676415", "1689212415");
};

main();
