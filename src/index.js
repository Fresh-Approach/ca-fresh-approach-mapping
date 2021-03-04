import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Router, Link, Redirect } from "@reach/router";
import queryString from "query-string";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import CustomMap from "./map";

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
        {accessToken && <CustomMap path="/" token={accessToken} />}
        <GoogleRedirect path="dashboard" />
        <Login path="/" />
      </Router>
    </div>
  );
}

const REDIRECT_URI = `${window.location.origin}/dashboard`;
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const Login = () => (
  <Container style={{ marginTop: 200 }} maxWidth="sm">
    <Card
      style={{ textAlign: "center", backgroundColor: "#FAFAFA", padding: 40 }}
    >
      <img
        src="https://www.freshapproach.org/wp-content/uploads/thegem-logos/logo_208de50a8fceed5aa45399761a0bdc04_1x.png"
        alt="Fresh Approach Logo"
        style={{ paddingBottom: 12 }}
      />
      <Typography style={{ paddingBottom: 12 }} variant="h4" component="h4">
        Welcome
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SHEETS_SCOPE}`}
      >
        Login
      </Button>
    </Card>
  </Container>
);

const GoogleRedirect = ({ location }) => {
  useEffect(() => {
    console.log("HASH", queryString.parse(location.hash));
    localStorage.setItem(
      GOOGLE_CLIENT_ACCESS_TOKEN,
      queryString.parse(location.hash).access_token
    );
  }, []);

  return <Redirect noThrow={true} to="/" />;
};

ReactDOM.render(<App />, document.querySelector("#app"));
