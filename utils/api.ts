import Constants from "expo-constants";

function getHost() {
  // Expo Go (new)
  const hostUri =
    Constants.expoConfig?.extra?.expoClient?.hostUri ||
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.hostUri;

  if (hostUri) {
    return hostUri.split(":")[0];
  }

  return "127.0.0.1";
}

export const API_BASE = `http://${getHost()}:4000`;