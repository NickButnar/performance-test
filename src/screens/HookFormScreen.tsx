import { View, Text, StyleSheet } from 'react-native'

export const HookFormScreen = () => {
  return (
    <View style={styles.container}>
      <Text>HookFormScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});

