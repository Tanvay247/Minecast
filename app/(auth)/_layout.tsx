import { Stack } from 'expo-router';
import React from 'react';


export default function () {

  return (

    <Stack>
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>


  );
}
