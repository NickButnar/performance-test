import { Button, StyleSheet, View } from "react-native";

import { runScenario } from "./driver";
import { report } from "./registry";

export const BenchPanel = () => {
  return (
    <View style={styles.panel}>
      <Button title="Run ×5" onPress={runScenario} />
      <Button title="Report" onPress={report} />
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
});
