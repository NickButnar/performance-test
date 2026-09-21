import { Stack } from 'expo-router'

export default function FlashListLayout() {
  return (
   <Stack>
    <Stack.Screen name="index" options={{ title: "FlashList" }} />
   </Stack>
  )
}

