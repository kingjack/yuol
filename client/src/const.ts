export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  
  console.log('OAuth config:', { oauthPortalUrl, appId, redirectUri })
  // Encode state as JSON to support returnTo
  const statePayload = {
    redirectUri,
    returnTo: window.location.href
  };
  const state = btoa(JSON.stringify(statePayload));

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  console.log('Generated login URL:', url.toString());
  return url.toString();
};
