import { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_MSAL_CLIENT_ID || "mock-msal-client-id",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "/",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};
