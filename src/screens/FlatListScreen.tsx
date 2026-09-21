import { StyleSheet, Text, View } from "react-native";

export const FlatListScreen = () => {
  return (
    <View style={styles.container}>
      <Text>FlatList benchmark</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
