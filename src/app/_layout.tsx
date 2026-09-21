import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "api/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
      <Stack.Screen name="index" options={{ title: "Benchmarks" }} />
      <Stack.Screen name="flatlist" options={{ headerShown: false }} />
      <Stack.Screen name="flashlist" options={{ headerShown: false }} />
      <Stack.Screen name="final-form" options={{ headerShown: false }} />
      <Stack.Screen name="hook-form" options={{ headerShown: false }} />
    </Stack>
    </QueryClientProvider>
  );
}
