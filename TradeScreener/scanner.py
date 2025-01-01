import time
import datetime
from fyers_apiv3 import fyersModel
import pandas as pd
import credentials as crs

# **Global Variables**
DAYS_RANGE = 4  # Number of days to look back
PERCENTAGE_DROP_THRESHOLD = -1  # Percentage drop threshold

# **1. FYERS API Credentials and Authentication**
client_id = crs.client_id
secret_key = crs.secret_key
redirect_uri = crs.redirect_uri

# **2. Access Token Retrieval**
file_path = './access.txt'
with open(file_path, 'r') as file:
    access_token = file.read().strip()

# **3. Initialize FYERS API Object**
fyers = fyersModel.FyersModel(
    token=access_token, is_async=False, client_id=client_id, log_path="")

# **4. Nifty 50 Stock Symbols**
with open('nifty_50_symbols.txt', 'r') as file:
    nifty_50_symbols = [line.strip() for line in file if line.strip()]

# **5. Calculate Date Range (Last X Days)**
today = datetime.datetime.today()
start_date = today - datetime.timedelta(days=DAYS_RANGE)

# **6. Convert Dates to Epoch Timestamps**
end_timestamp = int(time.mktime(today.timetuple()))
start_timestamp = int(time.mktime(start_date.timetuple()))
print(f"Start Timestamp: {datetime.datetime.fromtimestamp(
    start_timestamp).strftime('%d-%m-%Y')}")
print(f"End Timestamp: {datetime.datetime.fromtimestamp(
    end_timestamp).strftime('%d-%m-%Y')}")

# **7. Scan Nifty 50 Stocks**
stocks_down_threshold = []
for symbol in nifty_50_symbols:
    data = {
        "symbol": symbol,
        "resolution": "D",
        "date_format": "0",
        "range_from": start_timestamp,
        "range_to": end_timestamp,
        "cont_flag": "1"
    }
    historical_data = fyers.history(data)

    if historical_data['s'] == 'error':
        print(f"Error fetching data for {symbol}: {
              historical_data['message']}")
        continue

    df = pd.DataFrame(historical_data['candles'], columns=[
                      't', 'o', 'h', 'l', 'c', 'v'])
    if len(df) >= 2:
        close_price_start = df.iloc[0]['c']
        latest_close_price = df.iloc[-1]['c']
        percentage_change = (
            (latest_close_price - close_price_start) / close_price_start) * 100

        if percentage_change <= PERCENTAGE_DROP_THRESHOLD:
            stocks_down_threshold.append((symbol, percentage_change))

# **8. Print Results**
print(f"Nifty 50 Stocks Down {
      abs(PERCENTAGE_DROP_THRESHOLD)}% or More in the Last {DAYS_RANGE} Days:")
for symbol, percentage_change in stocks_down_threshold:
    print(f"{symbol}: {percentage_change:.2f}%")
