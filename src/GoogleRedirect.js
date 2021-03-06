import queryString from "query-string";

function GoogleRedirect({ stashToken }) {
  useEffect(() => {
    stashToken();
  }, [stashToken]);

  return <Redirect noThrow={true} to="/" />;
}

export default GoogleRedirect;
