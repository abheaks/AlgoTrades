const fyers = require("fyers-api-v2");

// const apiKey = "6FR49OXDIM-100";
// const apiSecret = "67C0VJ25RB";

export default auth = async () => {
  fyers.setAppId("6FR49OXDIM-100");
  fyers.setRedirectUrl(
    "https://trade.fyers.in/api-login/redirect-uri/index.html"
  );

  fyers.generateAuthCode();
  /*auth_code : “This will be the response of the generateAuthCode method once you click on the redirect_url you will be provided with the auth_code”*/

  const reqBody = {
    auth_code:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkubG9naW4uZnllcnMuaW4iLCJpYXQiOjE2ODkxNzYwMTYsImV4cCI6MTY4OTIwNjAxNiwibmJmIjoxNjg5MTc1NDE2LCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImF1dGhfY29kZSIsImRpc3BsYXlfbmFtZSI6IlhBMzAyMDIiLCJvbXMiOiJLMSIsIm5vbmNlIjoiIiwiYXBwX2lkIjoiNkZSNDlPWERJTSIsInV1aWQiOiJjYzY4YjI3ZDg2Y2U0ZDkzYTc2OGIzMzJmNzViZDViYyIsImlwQWRkciI6IjE1MC4xMjkuMTAyLjc0LCAxMzAuMTc2LjE4NC4xNyIsInNjb3BlIjoiIn0.ODtTkZUtvYx2XhCjDx_leIX1glsMhQm91rnHvCk06Ss",

    secret_key: "67C0VJ25RB",
  };

  let token = await fyers.generate_access_token(reqBody).then((response) => {
    console.log(response);
    return response;
  });
  console.log("token"), token;

  // fyers.setAccessToken(
  //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2ODkxNzYwNTIsImV4cCI6MTY4OTIwODIxMiwibmJmIjoxNjg5MTc2MDUyLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCa3JzZjBxZ2w1MzhVYUhWY3N5akNvS0cyQi1oclRVeTlLOFB6VUUxN0MxYmtVOVA2cnp3OVVYdkNhTVVhOEZKMHBMbE91UHQ3LTgxV28tX0ViZnhDZTJXWmNHVnRJdmJKRHZiSkFOWkpKakE4eVJWUT0iLCJkaXNwbGF5X25hbWUiOiJBQkhJSklUSCBTVURIQUtBUkFOIiwib21zIjoiSzEiLCJmeV9pZCI6IlhBMzAyMDIiLCJhcHBUeXBlIjoxMDAsInBvYV9mbGFnIjoiTiJ9.AuwgkV3koJoS7Lj0_GFYqHD0WxTHiJo-RpQtxhn8Dn0"
  // );
  fyers.setAccessToken(token.access_token);

  fyers.get_profile().then((response) => {
    console.log(response);
  });

  return fyers;
};
