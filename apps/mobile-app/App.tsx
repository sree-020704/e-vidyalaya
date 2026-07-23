import React from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>e-Vidyalaya Mobile</Text>
        <Text style={styles.subtitle}>Cross-platform Student Gateway</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1E3D",
    justifyContent: "center",
    alignItems: "center",
  },
  card: { padding: 20, backgroundColor: "#ffffff", borderRadius: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#0F1E3D" },
  subtitle: { fontSize: 12, color: "#B8842E", marginTop: 4 },
});
