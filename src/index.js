import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Router, Redirect } from "@reach/router";

import CustomMap from "./CustomMap";
import GoogleRedirect from "./GoogleRedirect";

const GOOGLE_CLIENT_ACCESS_TOKEN = "google_client_access_token";

function App() {
  const [accessToken, setAccessToken] = useState();

  useEffect(() => {
    const token = localStorage.getItem(GOOGLE_CLIENT_ACCESS_TOKEN);
    setAccessToken(token);
  }, []);

  return (
    <div>
      <Router>
        {accessToken && (
          <CustomMap
            path="/"
            token={accessToken}
            removeToken={() => {
              localStorage.removeItem(GOOGLE_CLIENT_ACCESS_TOKEN);
              setAccessToken(null);
            }}
          />
        )}
        <GoogleRedirect
          path="/redirect"
          stashToken={() => {
            localStorage.setItem(
              GOOGLE_CLIENT_ACCESS_TOKEN,
              queryString.parse(location.hash).access_token
            );
          }}
        />
        <Login path="/" />
      </Router>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
