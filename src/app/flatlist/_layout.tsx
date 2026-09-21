import { Stack } from "expo-router";

export default function FlatListLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "FlatList" }} />
    </Stack>
  );
}
