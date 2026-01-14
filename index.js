import "react-native-get-random-values";

import * as Crypto from "expo-crypto";

// 👇 THIS LINE IS THE MISSING PIECE
if (!global.crypto) {
  // @ts-ignore
  global.crypto = Crypto;
}

import "expo-router/entry";
