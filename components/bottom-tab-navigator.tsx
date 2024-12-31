import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Book, User } from 'lucide-react-native';

export function BottomTabNavigator() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/courses')}
            >
                <Book
                    size={24}
                    color={pathname.includes('courses') ? '#344939' : '#6A776D'}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/profile')}
            >
                <User
                    size={24}
                    color={pathname.includes('profile') ? '#344939' : '#6A776D'}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#A9B4AC',
        height: 60,
        borderTopWidth: 1,
        borderTopColor: '#6A776D',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

