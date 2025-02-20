import { Stack } from "expo-router"

export default function AuthenticatedLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="settings"
                options={{
                    headerShown: false,
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name="course/[id]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}

