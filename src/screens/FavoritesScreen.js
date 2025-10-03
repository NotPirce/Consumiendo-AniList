import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFavorites } from "../context/FavoritesContext";

export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#5f6368" }}>
          Aun no tienes personajes favoritos
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 12, gap: 10 }}
      data={favorites}
      keyExtractor={(i) => i.id.toString()}
      numColums={3}
      columnWrapperStyle={{ gap: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("Inicio", {
              screen: "CharacterDetail",
              params: { id: item.id },
            })
          }
        >
          <Image source={{ uri: item.image }} style={styles.img} />
          <Text numberOfLines={2} style={styles.name}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => removeFavorite(item.id)}
            style={styles.removeBtn}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "32%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  img: { width: 82, height: 104, borderRadius: 8, backgroundColor: "#e5e7eb" },
  name: {
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  removeBtn: { position: "absolute", top: 8, right: 8 },
});
