import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
    if (!token) {
      router.replace("/login");
    }
  };

  return (
    <Stack screenOptions={{headerShown:false}}>
      {isAuthenticated ? (
        <Stack.Screen 
          name="(authenticated)" 
          options={{ headerShown: false }} 
        />
      ) : (
        <Stack.Screen 
          name="(unauthenticated)" 
          options={{ headerShown: false ,headerBackVisible: false}} 
        />
      )}
    </Stack>
  );
}

