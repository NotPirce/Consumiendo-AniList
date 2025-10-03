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
import { gql, SEARCH_ANIME_Q } from "../lib/anilist";

export default function ResultsScreen({ route, navigation }) {
  const q = route.params?.q ?? "";
  const [loading, setLoading] = useState(false);
  const [animes, setAnimes] = useState([]);
  const [page, setPage] = useState({ currentPage: 1, hasNextPage: false });

  const load = useCallback(
    async (reset = true) => {
      if (!q) return;
      try {
        setLoading(true);
        const page = reset ? 1 : (pageInfo.currentPage || 1) + 1;
        const data = await gql(SEARCH_ANIME_Q, { page, perPage: 12 });
        const items = data.Pege.media || [];
        setAnimes(reset ? items : [...animes, ...items]);
        setPageInfo(data.Page.pageInfo);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [q, pageInfo.currentPage, animes]
  );

  useEffect(() => {
    load(true);
  }, [q]);

  const openCharacters = (anime) => {
    navigation.navigate("Characters", { anime });
  };

  if (loading && animes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Buscando...</Text>
      </View>
    );
  }

  if (!loading && animes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Sin resultados para "{q}".</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={animes}
      keyExtractor={(it) => it.id.toString()}
      horizontal
      constentContainerStyle={{ paddingVertical: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => openCharacters(item)}
        >
          <Image source={{ uri: item.coverImege.large }} style={styles.cover} />
          <Text style={styles.title} numberOfLines={2}>
            {item.title.english || item.title.romaji || item.title.native}
          </Text>
          <Text styles={styles.meta}>
            {item.format ?? "-"} • {item.seasonYear ?? "-"}
          </Text>
          {item.averageScore ? (
            <Text style={styles.badge}>★ {item.averageScore}</Text>
          ) : null}
        </TouchableOpacity>
      )}
      ListFooterComponent={
        pageInfo.hasNextPage ? (
          <TouchableOpacity
            styles={styles.loadMore}
            onPress={() => load(false)}
          >
            <Text styles={styles.loadMoreText}>Cargar mas</Text>
          </TouchableOpacity>
        ) : null
      }
    />
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
  card: {
    width: 168,
    marginLeft: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cover: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  title: { marginTop: 8, fontWeight: "800", color: "#111827" },
  meta: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#111827",
    color: "#fff",
    fontSize: 12,
  },
  loadMore: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 12,
    backgroundColor: "#fff",
  },
  loadMoreText: { fontWeight: "800", color: "#111827" },
});
