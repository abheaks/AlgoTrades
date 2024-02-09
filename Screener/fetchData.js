async function getHistory() {
  let history = new fyers.history();
  let result = await history
    .setSymbol("NSE:SBIN-EQ")
    .setResolution("D")
    .setDateFormat(0)
    .setRangeFrom("1622097600")
    .setRangeTo("1622097685")
    .getHistory();
  console.log(result);
}

getHistory();
