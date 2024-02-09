const fyers = require("fyers-api-v2");

// const apiKey = "6FR49OXDIM-100";
// const apiSecret = "67C0VJ25RB";
fyers.setAppId("6FR49OXDIM-100");
fyers.setRedirectUrl(
  "https://trade.fyers.in/api-login/redirect-uri/index.html"
);

// fyers.generateAuthCode();
/*auth_code : “This will be the response of the generateAuthCode method once you click on the redirect_url you will be provided with the auth_code”*/

const reqBody = {
  auth_code:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkubG9naW4uZnllcnMuaW4iLCJpYXQiOjE2ODkxNzY5ODYsImV4cCI6MTY4OTIwNjk4NiwibmJmIjoxNjg5MTc2Mzg2LCJhdWQiOiJbXCJ4OjBcIiwgXCJ4OjFcIiwgXCJ4OjJcIiwgXCJkOjFcIiwgXCJkOjJcIiwgXCJ4OjFcIiwgXCJ4OjBcIl0iLCJzdWIiOiJhdXRoX2NvZGUiLCJkaXNwbGF5X25hbWUiOiJYQTMwMjAyIiwib21zIjoiSzEiLCJub25jZSI6IiIsImFwcF9pZCI6IjZGUjQ5T1hESU0iLCJ1dWlkIjoiNzI2MWFmYWI3MDliNDk2MjliOWY2Y2EwNWUyNmViNzciLCJpcEFkZHIiOiIwLjAuMC4wIiwic2NvcGUiOiIifQ.AMf-zsgFYKZCbCCI9vJ4DY-2Jffb63NsUMr5sHZ7Hk8",

  secret_key: "67C0VJ25RB",
};

fyers.generate_access_token(reqBody).then((response) => {
  console.log(response);
});

fyers.setAccessToken(
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2ODkxNzcwMTksImV4cCI6MTY4OTIwODIxOSwibmJmIjoxNjg5MTc3MDE5LCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCa3JzdTdrSC1pblBKbWduLUllbkRwcm92VHI0OGVrQUplZ1ZGMjFncF9tZDNSSkNjRWg1SEZ2MGpKamFCUTdSWTY2eHg5WTB1QTdxQi15dXRra3pSOVBzSzZaeklNWDNBX1ZOY3FJb0JLYXJQWjRhWT0iLCJkaXNwbGF5X25hbWUiOiJBQkhJSklUSCBTVURIQUtBUkFOIiwib21zIjoiSzEiLCJmeV9pZCI6IlhBMzAyMDIiLCJhcHBUeXBlIjoxMDAsInBvYV9mbGFnIjoiTiJ9.khkMQm4GBVY3lDfAmHDXvlNaytWkXrFeNt0qHOSM0DY"
);

fyers.get_profile().then((response) => {
  console.log(response);
});
// fyers.get_funds().then((response) => {
//   console.log(response);
// });
// fyers.get_holdings().then((response) => {
//   console.log(response);
// });
// fyers.get_orders().then((response) => {
//   console.log(response);
// });
