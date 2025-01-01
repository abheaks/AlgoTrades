# Import the required module from the fyers_apiv3 package
from fyers_apiv3 import fyersModel
import credentials as crs
import webbrowser

# Define your Fyers API credentials
client_id = crs.client_id  # Replace with your client ID
secret_key = crs.secret_key  # Replace with your secret key
redirect_uri = crs.redirect_uri
# Replace with your redirect URI
response_type = "code"
grant_type = "authorization_code"
state = "sample"


# Create a session object to handle the Fyers API authentication and token
# generation
session = fyersModel.SessionModel(
    client_id=client_id,
    secret_key=secret_key,
    redirect_uri=redirect_uri,
    response_type=response_type,
    grant_type=grant_type,
    state=state
)

# Set the authorization code in the session object


# Generate the access token using the authorization code
response = session.generate_authcode()

# Print the response, which should contain the access token and other details
print(response)
webbrowser.open(response, new=1)

# newurl = input("Enter the url: ")
# auth_code = newurl[newurl.index('auth_code=')+10:newurl.index('&state')]
# print(auth_code)

auth_code = input("Enter the Auth_code: ")


grant_type = "authorization_code"
session = fyersModel.SessionModel(
    client_id=client_id,
    secret_key=secret_key,
    redirect_uri=redirect_uri,
    response_type=response_type,
    grant_type=grant_type
)

# Set the authorization code in the session object
session.set_token(auth_code)

# Generate the access token using the authorization code
response = session.generate_token()

# Print the response, which should contain the access token and other details
print(response)


# There can be two cases over here you can successfully get the acccessToken
# over the request or you might get some error over here. so to avoid that
# have this in try except block
try:
    access_token = response["access_token"]
    with open('access.txt', 'w') as k:
        k.write(access_token)
except Exception as e:
    print(e, response)
