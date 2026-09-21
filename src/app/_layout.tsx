import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Benchmarks" }} />
      <Stack.Screen name="flatlist" options={{ headerShown: false }} />
      <Stack.Screen name="flashlist" options={{ headerShown: false }} />
      <Stack.Screen name="final-form" options={{ headerShown: false }} />
      <Stack.Screen name="hook-form" options={{ headerShown: false }} />
    </Stack>
  );
}
