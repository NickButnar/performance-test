import { router } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";


export default function Index() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.navigate("/flatlist")}>
        <Text style={styles.linkText}>FlatList</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.navigate("/flashlist")}>
        <Text style={styles.linkText}>FlashList</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.navigate("/final-form")}>
        <Text style={styles.linkText}>FinalForm</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.navigate("/hook-form")}>
        <Text style={styles.linkText}>HookForm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 32, alignItems: "center", justifyContent: "center" },
  linkText: { fontSize: 16, fontWeight: "600" },
});
