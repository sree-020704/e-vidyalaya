import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ClassCardProps {
  title: string;
  time: string;
  instructor: string;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  title,
  time,
  instructor,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>
        🕒 {time} · Faculty: {instructor}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E6EC",
  },
  title: { fontSize: 14, fontWeight: "bold", color: "#0F1E3D" },
  meta: { fontSize: 11, color: "#767f8c", marginTop: 4 },
});
