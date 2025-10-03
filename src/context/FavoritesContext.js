import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@favorites");
        if (raw) setFavorites(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@favorites", JSON.stringify(favorites)).catch(
      () => {}
    );
  }, [favorites]);

  const addFavorite = (char) => {
    setFavorites((prev) =>
      prev.some((c) => c.id === char.id) ? prev : [...prev, char]
    );
  };

  const removeFavorite = (id) =>
    setFavorites((prev) => prev.filter((c) => c.id !== id));

  const isFavorite = (id) => favorites.some((c) => c.id === id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
