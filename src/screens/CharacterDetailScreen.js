import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { gql, CHARACTER_DETAIL_Q } from "../lib/anilist";
import { useFavorites } from "../context/FavoritesContext";

export default function CharacterDetailScreen({ route }) {
  const id = route.params?.id;
  const [loading, setLoading] = useState(true);
  const [char, setChar] = useState(null);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    (async () => {
      try {
        const data = await gql(CHARACTER_DETAIL_Q, { id: Number(id) });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Cargando...</Text>
      </View>
    );
  }
  if (!char)
    return (
      <View style={styles.center}>
        <Text>No encontrado.</Text>
      </View>
    );

  const dob = char.dateOfBirth;
  const dobText =
    dob?.day || dob?.month || dob?.year
      ? `${dob?.day ?? "?"}/${dob?.month ?? "?"}/${dob?.year ?? "?"}`
      : "—";

  const cleanDesc = (char.description || "")
    .replace(/<br>/g, "\n")
    .replace(/<\/?i>/g, "_");

  const toggleFav = () => {
    const item = { id: char.id, name: char.name.full, image: char.image.large };
    isFavorite(char.id) ? removeFavorite(char.id) : addFavorite(item);
  };

  return (
    <ScrollView contentConteinerStyle={{ padding: 16 }}>
      <View style={style.header}>
        <Image source={{ uri: char.image.large }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{char.name.full}</Text>
          <Text style={styles.native}>{char.name.native || ""}</Text>
          <Text style={styles.meta}>
            Edad: {char.age ?? "-"} • Genero: {char.gender ?? "-"}
          </Text>
          <Text style={styles.meta}>Nacimiento: {dobText}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <TouchableOpacity onPress={toggleFav} style={styles.btn}>
              <Text style={styles.btnText}>
                {isFavorite(char.id)
                  ? "Quitar de favoritos"
                  : "Agregar a favoritos"}
              </Text>
            </TouchableOpacity>
            {char.siteUrl ? (
              <TouchableOpacity
                onPresss={(() => Linking, openURL(char.siteUrl))}
                style={[styles.btn, { backgroundColor: "#0ea5e9" }]}
              >
                <Text style={styles.btnText}>Ver en AniList</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Descripcion</Text>
      <Text style={styles.desc}>{cleanDesc || "Sin descripcion."}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  muted: { color: "#5f6368", marginTop: 6 },
  header: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 120,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  name: { fontSize: 20, fontWeight: "800", color: "#111827" },
  native: { color: "#6b7280", marginTop: 2 },
  meta: { color: "#374151", marginTop: 6 },
  btn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { marginTop: 16, fontWeight: "800", fontSize: 16 },
  desc: { marginTop: 8, color: "#374151", lineHeight: 20 },
});
