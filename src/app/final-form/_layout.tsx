import { Stack } from 'expo-router';

export default function FinalFormLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "FinalForm" }} />
    </Stack>
  );
}
