import os
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("SECRET_KEY")
redirect_uri = "https://trade.fyers.in/api-login/redirect-uri/index.html"
