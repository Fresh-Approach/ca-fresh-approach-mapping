import React, { useEffect } from "react";
import { Redirect } from "@reach/router";
import queryString from "query-string";

import { GOOGLE_CLIENT_ACCESS_TOKEN } from "./utils";

function GoogleRedirect({ token, setAccessToken }) {
  useEffect(() => {
    const token = queryString.parse(location.hash).access_token;
    localStorage.setItem(GOOGLE_CLIENT_ACCESS_TOKEN, token);
    setAccessToken(token);
  }, []);

  return token ? <Redirect noThrow={true} to="/" /> : null;
}

export default GoogleRedirect;
