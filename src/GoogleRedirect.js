import { Redirect } from "@reach/router";

function GoogleRedirect({ stashToken }) {
  useEffect(() => {
    stashToken();
  }, [stashToken]);

  return <Redirect noThrow={true} to="/" />;
}

export default GoogleRedirect;
