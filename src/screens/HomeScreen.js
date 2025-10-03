import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");

  const goSearch = () => {
    navigation.navigate("Results", { q: search.trim() });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>
          Analist Explorer
        </Text>
        <Text style={{ color: "#cbd5e1", margeinTop: 4 }}>
          Bienvenido. Busca animes y explora sus personajes.
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Ej. Bleach, Naruto, One Piece"
          placeHolderTextColor="#9aa0a6"
          value={search}
          onChageText={setSearch}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={goSearch}
        />
        <TouchableOpacity style={styles.btn} onPress={goSearch}>
          <Text styles={{ color: "#fff", fontWeigth: "800" }}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text styles={styles.heroTitle}>Explora por titulos populares</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flexDirection: "row", gap: 10, paddingHorizontal: 16 },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#374151",
  },
  btn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  hero: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  heroTitle: { fontWeight: "800", fontSize: 18, marginBottom: 4 },
  heroText: { color: "#374151" },
  heroBullet: { marginTop: 6, color: "#4b5563" },
});
