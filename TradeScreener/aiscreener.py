import time
import datetime
import pandas as pd
from fyers_apiv3 import fyersModel
import credentials as crs

# Global Configuration Variables
ATR_PERIOD = 20  # Period for ATR calculation
ATR_MULTIPLIER = 4  # Multiplier for ATR
VOL_SMA_LENGTH = 20  # Length for Volume SMA
LOOKBACK_CANDLES = 10  # Number of candles to look back for signals
CANDLE_TYPE = "D"  # Default candle type for daily candles

# Nifty 50 Stock Symbols
with open('./nifty_50_symbols.txt', 'r') as file:
    SYMBOLS = [line.strip() for line in file if line.strip()]

# FYERS API Credentials
client_id = crs.client_id
file_path = './access.txt'
with open(file_path, 'r') as file:
    access_token = file.read().strip()  # Assuming this is already generated

# Initialize FYERS API
fyers = fyersModel.FyersModel(token=access_token, is_async=False)

# Fetch Historical Data Function


def fetch_candles(symbol, start, end):
    data = {
        "symbol": symbol,
        "resolution": CANDLE_TYPE,  # Use global variable for candle type
        "date_format": "0",
        "range_from": start,
        "range_to": end,
        "cont_flag": "1"
    }
    response = fyers.history(data)
    if response["s"] == "error":
        print(f"Error fetching data for {symbol}: {response['message']}")
        return None
    return pd.DataFrame(response["candles"], columns=["timestamp", "open",
                                                      "high", "low", "close",
                                                      "volume"])

# ATR Calculation


def calculate_atr(df, period):
    high_low = df["high"] - df["low"]
    high_close = abs(df["high"] - df["close"].shift(1))
    low_close = abs(df["low"] - df["close"].shift(1))
    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr

# Trailing Stop and Signal Calculation


def calculate_signals(df, atr, atr_multiplier):
    n_loss = atr * atr_multiplier
    x_atr_trailing_stop = [None] * len(df)
    pos = [0] * len(df)
    long_signal = []
    short_signal = []

    for i in range(1, len(df)):
        # Initialize trailing stop
        if x_atr_trailing_stop[i - 1] is None:
            x_atr_trailing_stop[i] = df["close"][i] - n_loss[i]
        else:
            if df["close"][i - 1] > x_atr_trailing_stop[i - 1]:
                x_atr_trailing_stop[i] = max(
                    x_atr_trailing_stop[i - 1], df["close"][i] - n_loss[i])
            elif df["close"][i - 1] < x_atr_trailing_stop[i - 1]:
                x_atr_trailing_stop[i] = min(
                    x_atr_trailing_stop[i - 1], df["close"][i] + n_loss[i])
            else:
                x_atr_trailing_stop[i] = df["close"][i] - n_loss[i]

        # Ensure valid comparison
        if x_atr_trailing_stop[i - 1] is not None:
            if df["close"][i - 1] < x_atr_trailing_stop[i - 1] and df["close"][i] > x_atr_trailing_stop[i]:
                pos[i] = 1  # Buy
            elif df["close"][i - 1] > x_atr_trailing_stop[i - 1] and df["close"][i] < x_atr_trailing_stop[i]:
                pos[i] = -1  # Sell
            else:
                pos[i] = pos[i - 1]
        else:
            pos[i] = 0

        long_signal.append(pos[i] == 1)
        short_signal.append(pos[i] == -1)

    return long_signal, short_signal


# Main Logic
start_date = (datetime.date.today() -
              datetime.timedelta(days=30)).strftime("%Y-%m-%d")
end_date = datetime.date.today().strftime("%Y-%m-%d")
start_timestamp = int(time.mktime(
    datetime.datetime.strptime(start_date, "%Y-%m-%d").timetuple()))
end_timestamp = int(time.mktime(
    datetime.datetime.strptime(end_date, "%Y-%m-%d").timetuple()))

for symbol in SYMBOLS:
    df = fetch_candles(symbol, start_timestamp, end_timestamp)
    if df is None or df.empty:
        continue

    df["atr"] = calculate_atr(df, ATR_PERIOD)
    long_signal, short_signal = calculate_signals(
        df, df["atr"], ATR_MULTIPLIER)

    print(f"\n{symbol} Signals (Last {LOOKBACK_CANDLES} candles):")
    for i in range(-LOOKBACK_CANDLES, 0):
        signal = 'BUY' if long_signal[i] else 'SELL' if short_signal[i] else 'HOLD'
        print(f"Candle {i + LOOKBACK_CANDLES + 1}: {signal}")
