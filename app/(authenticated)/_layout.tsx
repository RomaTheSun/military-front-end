import { Tabs, Stack } from "expo-router"
import { BookOpen, User2 } from "lucide-react-native"

export default function AuthenticatedLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
    )
}

