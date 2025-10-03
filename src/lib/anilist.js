const ANILIST_URl = "https://graphql.anilist.co";

export async function gql(query, variables) {
  const res = await fetch(ANALIST_URl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors)
    throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

export const SEARCH_ANIME_Q = `
  query ($page: Int, $perPage: Int, $search: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji english native }
        coverImage { large }
        averageScore
        format
        seasonYear
      }
    }
  }
`;

export const ANIME_CHARACTERS_Q = `
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
          }
        }
      }
    }
  }
`;

export const CHARACTER_DETAIL_Q = `
  query ($id: Int!) {
    Character(id: $id) {
      id
      name { full native }
      image { large }
      age
      gender
      dateOfBirth { year month day }
      description(asHtml: false)
      siteUrl
    }
  }
`;
