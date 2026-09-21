import { StyleSheet, Text, View } from "react-native";

export const FlashListScreen = () => {
  return (
    <View style={styles.container}>
      <Text>FlashList benchmark</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
