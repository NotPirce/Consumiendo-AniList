import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import HomeScreen from "./src/screens/HomeScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import CharactersScreen from "./src/screens/CharactersScreen";
import CharacterDetailScreen from "./src/screens/CharacterDetailScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import { Ionicons } from "@expo/vector-icons";
import { text } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "AnaList Explorer" }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: "Resultados" }}
      />
      <Stack.Screen
        name="Characters"
        component={CharactersScreen}
        options={{ title: "Personajes" }}
      />
      <Stack.Screen
        name="CharacterDetail"
        component={CharacterDetailScreen}
        options={{ title: "Detalle del personaje" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShow: false }} />
        <Tab.Screen
          name="Inicio"
          component={HomeStack}
          options={{ tabBarIcon: () => <Text>🏠</Text> }}
        />
        <Tab.Screen
          name="Favoritos"
          component={FavoritesScreen}
          options={{ tabBarIcon: () => <Text>⭐</Text> }}
        />
        <Tab.Navigator />
      </NavigationContainer>
    </FavoritesProvider>
  );
}
