// App.js
import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const ANILIST_URL = "https://graphql.anilist.co";

// --- GraphQL ---
const SEARCH_ANIME_Q = `
  query ($page: Int, $perPage: Int, $search: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji english native }
        coverImage { large }
        episodes
        averageScore
        format
        season
        seasonYear
      }
    }
  }
`;

const ANIME_CHARACTERS_Q = `
  query ($id: Int!, $page: Int, $perPage: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      characters(page: $page, perPage: $perPage) {
        pageInfo { currentPage hasNextPage }
        edges {
          role
          node {
            id
            name { full }
            image { medium }
            siteUrl
          }
        }
      }
    }
  }
`;

// --- helper ---
async function gql(query, variables) {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList error ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

export default function AniList() {
  // UI state
  const [search, setSearch] = useState(""); // <- vacío (no “Bleach”)
  const [hasSearched, setHasSearched] = useState(false);

  // animes
  const [loading, setLoading] = useState(false);
  const [animes, setAnimes] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    hasNextPage: false,
  });

  // characters
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [charLoading, setCharLoading] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [charPage, setCharPage] = useState({
    currentPage: 1,
    hasNextPage: false,
  });

  const searchAnimes = useCallback(
    async (reset = true) => {
      if (!search.trim()) {
        // si no hay texto, no busques
        setHasSearched(true);
        setAnimes([]);
        setSelectedAnime(null);
        setCharacters([]);
        return;
      }
      try {
        setHasSearched(true);
        setLoading(true);
        const page = reset ? 1 : (pageInfo.currentPage || 1) + 1;
        const data = await gql(SEARCH_ANIME_Q, { page, perPage: 12, search });
        const newMedia = data.Page.media || [];
        setAnimes(reset ? newMedia : [...animes, ...newMedia]);
        setPageInfo(data.Page.pageInfo);
        if (reset) {
          setSelectedAnime(null);
          setCharacters([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [search, pageInfo.currentPage, animes]
  );

  const loadCharacters = useCallback(
    async (animeId, reset = true) => {
      try {
        setCharLoading(true);
        const page = reset ? 1 : (charPage.currentPage || 1) + 1;
        const data = await gql(ANIME_CHARACTERS_Q, {
          id: animeId,
          page,
          perPage: 25,
        });
        const edges = data.Media?.characters?.edges ?? [];
        const mapped = edges.map((e, i) => ({
          id: e.node.id.toString() + "-" + (i + (page - 1) * 25),
          name: e.node.name.full,
          role: e.role,
          image: e.node.image?.medium,
        }));
        setCharacters(reset ? mapped : [...characters, ...mapped]);
        setCharPage(data.Media.characters.pageInfo);
      } catch (e) {
        console.error(e);
      } finally {
        setCharLoading(false);
      }
    },
    [charPage.currentPage, characters]
  );

  const onSelectAnime = (anime) => {
    setSelectedAnime(anime);
    setCharacters([]);
    setCharPage({ currentPage: 1, hasNextPage: false });
    loadCharacters(anime.id, true);
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>AniList Explorer</Text>
        <Text style={styles.subtitle}>
          Busca animes, mira detalles y personajes
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Buscar anime… (ej. Bleach, Naruto, One Piece)"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => searchAnimes(true)}
          style={styles.input}
          returnKeyType="search"
          placeholderTextColor="#9aa0a6"
        />
        <TouchableOpacity style={styles.btn} onPress={() => searchAnimes(true)}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Bienvenida (solo si no se ha buscado) */}
      {!hasSearched ? (
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Nuevo</Text>
          </View>
          <Text style={styles.heroTitle}>¡Bienvenido/a!</Text>
          <Text style={styles.heroText}>
            Esta es la app <Text style={styles.bold}>AniList</Text> donde puedes
            encontrar
            <Text style={styles.bold}> animes</Text> y sus{" "}
            <Text style={styles.bold}>personajes</Text>.
          </Text>
          <Text style={[styles.heroText, { marginTop: 6 }]}>
            Empieza escribiendo el nombre de un anime arriba y toca{" "}
            <Text style={styles.bold}>Buscar</Text>.
          </Text>
          <View style={styles.heroBullets}>
            <Text style={styles.bullet}>
              • Resultados populares ordenados por popularidad
            </Text>
            <Text style={styles.bullet}>
              • Toca un anime para ver su reparto de personajes
            </Text>
            <Text style={styles.bullet}>
              • Carga más resultados con “Cargar más”
            </Text>
          </View>
        </View>
      ) : null}

      {/* Resultados de búsqueda */}
      {hasSearched ? (
        loading && animes.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 6, color: "#5f6368" }}>Buscando…</Text>
          </View>
        ) : animes.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: "#5f6368" }}>
              Sin resultados. Prueba con otro término.
            </Text>
          </View>
        ) : (
          <FlatList
            data={animes}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => onSelectAnime(item)}
              >
                <Image
                  source={{ uri: item.coverImage.large }}
                  style={styles.cover}
                />
                <Text style={styles.title} numberOfLines={2}>
                  {item.title.english || item.title.romaji || item.title.native}
                </Text>
                <Text style={styles.meta}>
                  {item.format ?? "—"} • {item.seasonYear ?? "—"}
                </Text>
                {item.averageScore ? (
                  <Text style={styles.badge}>★ {item.averageScore}</Text>
                ) : null}
              </TouchableOpacity>
            )}
            ListFooterComponent={
              pageInfo.hasNextPage ? (
                <TouchableOpacity
                  style={styles.loadMore}
                  onPress={() => searchAnimes(false)}
                >
                  <Text style={styles.loadMoreText}>Cargar más</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )
      ) : null}

      {/* Detalle de personajes */}
      {hasSearched ? (
        <View style={styles.section}>
          <Text style={styles.h2}>
            {selectedAnime
              ? `Personajes — ${
                  selectedAnime.title.english || selectedAnime.title.romaji
                }`
              : "Toca un anime para ver sus personajes"}
          </Text>

          {selectedAnime && (
            <>
              {charLoading && characters.length === 0 ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" />
                  <Text style={{ marginTop: 6, color: "#5f6368" }}>
                    Cargando personajes…
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={characters}
                  keyExtractor={(c) => c.id}
                  numColumns={3}
                  columnWrapperStyle={{ gap: 10 }}
                  contentContainerStyle={{ gap: 10 }}
                  renderItem={({ item }) => (
                    <View style={styles.charCard}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.charImg}
                      />
                      <Text numberOfLines={2} style={styles.charName}>
                        {item.name}
                      </Text>
                      <Text style={styles.charRole}>
                        {item.role?.toLowerCase()}
                      </Text>
                    </View>
                  )}
                  ListFooterComponent={
                    charPage.hasNextPage ? (
                      <TouchableOpacity
                        style={[styles.loadMore, { marginTop: 8 }]}
                        onPress={() => loadCharacters(selectedAnime.id, false)}
                      >
                        <Text style={styles.loadMoreText}>Más personajes</Text>
                      </TouchableOpacity>
                    ) : null
                  }
                />
              )}
            </>
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// --- styles (mejorados, sin librerías extra) ---
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f9fc" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#111827", // gris muy oscuro
  },
  brand: { color: "#fff", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#cbd5e1", marginTop: 2 },

  searchWrap: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    backgroundColor: "#111827",
    paddingBottom: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  btn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#2563eb", // azul
    justifyContent: "center",
    height: 46,
  },
  btnText: { color: "#fff", fontWeight: "800" },

  hero: {
    margin: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  heroBadgeText: { color: "#1d4ed8", fontWeight: "700" },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
    color: "#111827",
  },
  heroText: { color: "#374151", lineHeight: 20 },
  bold: { fontWeight: "800", color: "#111827" },
  heroBullets: { marginTop: 12, gap: 6 },
  bullet: { color: "#4b5563" },

  h2: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
    paddingHorizontal: 12,
  },

  // lista horizontal de animes
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
    elevation: 2,
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
    overflow: "hidden",
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

  // grid de personajes
  section: { flex: 1, marginTop: 10 },
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  charCard: {
    width: "32%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
});
