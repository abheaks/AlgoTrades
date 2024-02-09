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
// Calculate ATR
function calculateATR(data, period) {
  let sum = 0;
  console.log("data", data, period);
  for (let i = 1; i <= period; i++) {
    sum += Math.abs(data[data.length - i][2] - data[data.length - i][3]);
  }
  return sum / period;
}

// Calculate SMA
function calculateSMA(values, length) {
  let sum = values.slice(0, length).reduce((acc, value) => acc + value, 0);
  return sum / length;
}

// Calculate xATR Trailing Stop
function calculateXATRTrailingStop(
  close,
  prevClose,
  prevXATRTrailingStop,
  nLoss
) {
  if (close > prevXATRTrailingStop && prevClose > prevXATRTrailingStop) {
    return Math.max(prevXATRTrailingStop, close - nLoss);
  } else if (close < prevXATRTrailingStop && prevClose < prevXATRTrailingStop) {
    return Math.min(prevXATRTrailingStop, close + nLoss);
  } else if (close > prevXATRTrailingStop) {
    return close - nLoss;
  } else {
    return close + nLoss;
  }
}

// Calculate position
function calculatePosition(prevClose, prevXATRTrailingStop, prevPos) {
  if (prevClose < prevXATRTrailingStop && prevClose > 0) {
    return 1;
  } else if (prevClose > prevXATRTrailingStop && prevClose > 0) {
    return -1;
  } else {
    return prevPos;
  }
}

// Calculate long signal
function calculateLongSignal(
  prevClose,
  prevXATRTrailingStop,
  prevPos,
  prevIsLong
) {
  return prevPos === 1 && !prevIsLong;
}

// Calculate short signal
function calculateShortSignal(
  prevClose,
  prevXATRTrailingStop,
  prevPos,
  prevIsShort
) {
  return prevPos === -1 && !prevIsShort;
}

// Calculate average
function calculateAverage(values, xATRTrailingStops) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * xATRTrailingStops[i];
  }
  return sum / values.length;
}

// Calculate bar highlight color
function calculateBarHighlightColor(volume, volAvg, close, open) {
  if (volume > volAvg * 1.2 && close < open) {
    return "yellow";
  } else if (volume > volAvg * 1.2 && close > open) {
    return "yellow";
  } else {
    return "transparent";
  }
}

const signals = async (symbol, from, to) => {
  const result = await getHistory(symbol, from, to);
  // Define the historical data fetched using the getHistory function
  const historicalData = result.candles; // Make sure you extract the candles array from the result

  // Initialize variables and arrays
  let atrPeriod = 20;
  let atrMultiplier = 4;
  let atr = calculateATR(historicalData, atrPeriod);
  let nLoss = atrMultiplier * atr;
  let xATRTrailingStop = NaN;
  let pos = NaN;
  let isLong = false;
  let isShort = false;
  let len2 = 20;
  //   let src = data.close;
  let vol_length = 20;
  //   let vol_avg = calculateSMA(historicalData.volume, vol_length);

  let buySignals = [];
  let sellSignals = [];

  // Loop through historical data
  for (let i = 0; i < historicalData.length; i++) {
    atr = calculateATR(historicalData.slice(0, i + 1), atrPeriod);

    if (i === 0) {
      xATRTrailingStop = NaN;
      pos = NaN;
      isLong = false;
      isShort = false;
    } else {
      xATRTrailingStop = calculateXATRTrailingStop(
        historicalData[i].close,
        historicalData[i - 1].close,
        xATRTrailingStop,
        nLoss
      );
      pos = calculatePosition(
        historicalData[i - 1].close,
        xATRTrailingStop,
        pos
      );
    }

    if (
      calculateLongSignal(
        historicalData[i - 1].close,
        xATRTrailingStop,
        pos,
        isLong
      )
    ) {
      isLong = true;
      isShort = false;
      buySignals.push({
        datetime: new Date(historicalData[i].timestamp * 1000).toLocaleString(),
        price: historicalData[i].close,
        signal: "Buy",
      });
    }

    if (
      calculateShortSignal(
        historicalData[i - 1].close,
        xATRTrailingStop,
        pos,
        isShort
      )
    ) {
      isLong = false;
      isShort = true;
      sellSignals.push({
        datetime: new Date(historicalData[i].timestamp * 1000).toLocaleString(),
        price: historicalData[i].close,
        signal: "Sell",
      });
    }

    let avg1 = calculateAverage(
      out.slice(0, i + 1),
      xATRTrailingStop.slice(0, i + 1)
    );
    // let barHighlightColor = calculateBarHighlightColor(
    //   historicalData[i].volume,
    //   vol_avg,
    //   historicalData[i].close,
    //   historicalData[i].open
    // );

    // Plotting logic here
  }

  // Print buy and sell signals
  console.log("Buy Signals:", buySignals);
  console.log("Sell Signals:", sellSignals);
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
