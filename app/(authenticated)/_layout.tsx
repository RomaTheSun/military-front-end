import { BottomTabNavigator } from "@/components/bottom-tab-navigator";
import { Stack, Tabs } from "expo-router";
import { BookOpen, User2 } from "lucide-react-native";

export default function AuthenticatedLayout() {
    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: '#A9B4AC',
                        borderTopWidth: 1,
                        borderTopColor: '#6A776D',
                    },
                    tabBarActiveTintColor: '#344939',
                    tabBarInactiveTintColor: '#6A776D',
                }}
            >
                <Tabs.Screen
                    name="courses"
                    options={{
                        tabBarLabel: "Курси",
                        tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarLabel: "Профіль",
                        tabBarIcon: ({ color, size }) => <User2 color={color} size={size} />,
                    }}
                />
            </Tabs>
        </>
    );
}

