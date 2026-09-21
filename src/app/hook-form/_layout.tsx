import { Stack } from 'expo-router';

export default function HookFormLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "HookForm" }} />
    </Stack>
  );
}