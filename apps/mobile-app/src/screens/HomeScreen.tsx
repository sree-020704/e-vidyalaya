import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Student Mobile Timetable</Text>
      <Text style={styles.body}>Connected to e-Vidyalaya Live Engine</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F6F9" },
  heading: { fontSize: 18, fontWeight: "bold", color: "#0F1E3D" },
  body: { fontSize: 12, color: "#767f8c", marginTop: 6 },
});
