import time
import datetime
import pandas as pd
import numpy as np
from fyers_apiv3 import fyersModel
import credentials as crs

# Configuration
ATR_PERIOD = 80
ATR_MULTIPLIER = 4
VOL_LENGTH = 20
VWMA_PERIOD = 20
LOOKBACK_CANDLES = 10
CANDLE_TYPE = "D"

# Initialize Fyers
with open('./nifty_50_symbols.txt', 'r') as file:
    SYMBOLS = [line.strip() for line in file if line.strip()]

client_id = crs.client_id
with open('./access.txt', 'r') as file:
    access_token = file.read().strip()

fyers = fyersModel.FyersModel(token=access_token, is_async=False)


def fetch_candles(symbol, start, end):
    data = {
        "symbol": symbol,
        "resolution": CANDLE_TYPE,
        "date_format": "0",
        "range_from": start,
        "range_to": end,
        "cont_flag": "1"
    }
    response = fyers.history(data)
    if response["s"] == "error":
        print(f"Error fetching data for {symbol}: {response['message']}")
        return None

    df = pd.DataFrame(response["candles"],
                      columns=["timestamp", "open", "high", "low", "close", "volume"])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
    return df


def calculate_signals(df):
    # Calculate True Range and ATR
    def tr(data):
        data = data.copy()
        data['previous_close'] = data['close'].shift(1)
        data['high-low'] = abs(data['high'] - data['low'])
        data['high-pc'] = abs(data['high'] - data['previous_close'])
        data['low-pc'] = abs(data['low'] - data['previous_close'])
        tr = data[['high-low', 'high-pc', 'low-pc']].max(axis=1)
        return tr

    df['tr'] = tr(df)
    df['atr'] = df['tr'].rolling(window=ATR_PERIOD).mean()

    # Calculate trailing stop
    n_loss = df['atr'] * ATR_MULTIPLIER
    x_atr_trailing_stop = pd.Series(index=df.index, dtype=float)
    pos = pd.Series(0, index=df.index)

    for i in range(1, len(df)):
        prev_stop = x_atr_trailing_stop.iloc[i-1]
        curr_close = df['close'].iloc[i]
        prev_close = df['close'].iloc[i-1]
        curr_loss = n_loss.iloc[i]

        if pd.isna(prev_stop):
            x_atr_trailing_stop.iloc[i] = curr_close - curr_loss
        else:
            if prev_close > prev_stop:
                x_atr_trailing_stop.iloc[i] = max(
                    prev_stop, curr_close - curr_loss)
            elif prev_close < prev_stop:
                x_atr_trailing_stop.iloc[i] = min(
                    prev_stop, curr_close + curr_loss)
            else:
                x_atr_trailing_stop.iloc[i] = curr_close - curr_loss

        if i > 0:
            if prev_close < prev_stop and curr_close > x_atr_trailing_stop.iloc[i]:
                pos.iloc[i] = 1
            elif prev_close > prev_stop and curr_close < x_atr_trailing_stop.iloc[i]:
                pos.iloc[i] = -1
            else:
                pos.iloc[i] = pos.iloc[i-1]

    # VWMA calculation
    df['vwma'] = (df['close'] * df['volume']).rolling(window=VWMA_PERIOD).sum() / \
        df['volume'].rolling(window=VWMA_PERIOD).sum()

    # Volume analysis
    df['vol_sma'] = df['volume'].rolling(window=VOL_LENGTH).mean()
    df['unusual_vol_down'] = (
        df['volume'] > df['vol_sma'] * 1.2) & (df['close'] < df['open'])
    df['unusual_vol_up'] = (df['volume'] > df['vol_sma']
                            * 1.2) & (df['close'] > df['open'])

    # Generate signals
    df['buy_signal'] = (pos == 1) & (pos.shift(1) != 1)
    df['sell_signal'] = (pos == -1) & (pos.shift(1) != -1)

    # Average line
    df['avg_line'] = (df['vwma'] + x_atr_trailing_stop) / 2

    return df


def main():
    start_date = (datetime.date.today() -
                  datetime.timedelta(days=30)).strftime("%Y-%m-%d")
    end_date = datetime.date.today().strftime("%Y-%m-%d")

    start_timestamp = int(time.mktime(
        datetime.datetime.strptime(start_date, "%Y-%m-%d").timetuple()))
    end_timestamp = int(time.mktime(
        datetime.datetime.strptime(end_date, "%Y-%m-%d").timetuple()))

    for symbol in SYMBOLS:
        print(f"\nAnalyzing {symbol}")
        df = fetch_candles(symbol, start_timestamp, end_timestamp)

        if df is None or df.empty:
            continue

        result_df = calculate_signals(df)

        # Get last N candles
        last_candles = result_df.tail(LOOKBACK_CANDLES)
        print(f"Last {LOOKBACK_CANDLES} candles analysis:")

        for idx, row in last_candles.iterrows():
            signal = "BUY" if row['buy_signal'] else "SELL" if row['sell_signal'] else "HOLD"
            vol_signal = ""
            if row['unusual_vol_up']:
                vol_signal = "HIGH VOLUME (Bullish)"
            elif row['unusual_vol_down']:
                vol_signal = "HIGH VOLUME (Bearish)"

            print(
                f"Date: {row['timestamp'].strftime('%Y-%m-%d')} | Signal: {signal} | {vol_signal}")


if __name__ == "__main__":
    main()
