import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { gql, ANIME_CHARACTERS_Q } from "../lib/anilist";
import { useFavorites } from "../context/FavoritesContext";

export default function CharactersScreen({ route, navigation }) {
  const anime = route.params?.anime;
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    hasNextPage: false,
  });
  const { addFavorite, isFavorite, removeFavorite } = useFavorites();

  const load = useCallback(
    async (reset = true) => {
      try {
        setLoading(true);
        const page = reset ? 1 : (pageInfo.currentPage || 1) + 1;
        const data = await gql(ANIME_CHARACTERS_Q, {
          id: anime.id,
          page,
          perPage: 25,
        });
        const edges = data.Media?.characters?.edges ?? [];
        const mapped = edges.map((e, i) => ({
          id: e.node.id,
          name: e.node.name.full,
          image: e.node.image?.medium,
          role: e.role,
        }));
        setCharacters(reset ? mapped : [...characters, ...mapped]);
        setPageInfo(data.Media.characters.pageInfo);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [anime?.id, pageInfo.currentPage, characters]
  );

  const openDetail = (char) => {
    if (isFavorite(char.id)) removeFavorite(char.id);
    else addFavorite({ id: char.id, name: char.name, image: char.image });
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: "800", fontSize: 16, marginButtom: 8 }}>
        Personajes - {anime.title.english || anime.title.romaji}
      </Text>

      {loading && characters.length === 0 ? (
        <View style={StyleSheet.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(c) => c.id.toString()}
          numColumns={3}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.charCard}
              onPress={() => openDetail(item.id)}
            >
              <Image source={{ uri: item.image }} style={styles.charImg} />
              <Text numberOfLines={2} style={styles.charName}>
                {item.name}
              </Text>
              <Text style={styles.charRole}>{item.role?.toLowerCase()}</Text>

              <TouchableOpacity
                onPress={() => toggleFav(item)}
                style={styles.favBtn}
              >
                <Text style={{ fontSize: 16 }}>
                  {isFavorite(item.id) ? "💛" : "🤍"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            pageInfo.hasNextPage ? (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={() => load(false)}
              >
                <Text style={styles.loadMoreText}>Más</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#5f6368", marginTop: 6 },
  charCard: {
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
  charImg: {
    width: 82,
    height: 104,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  charName: {
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  charRole: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  favBtn: { position: "absolute", top: 8, right: 8 },
  loadMore: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginTop: 10,
  },
  loadMoreText: { fontWeight: "800", color: "#111827" },
});
