import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Settings, LogOut } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from "../../../config"

interface UserData {
    id: string;
    email: string;
    nickname: string;
}

interface CourseProgress {
    name: string;
    progress: number;
}


const courses: CourseProgress[] = [
    { name: 'Назва Курсу', progress: 25 },
    { name: 'Назва Курсу', progress: 25 },
    { name: 'Назва Курсу', progress: 25 },
    { name: 'Назва Курсу', progress: 25 },
];

export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            const response = await fetch(`${apiUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            setUserData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            fetchUserData()
        }, [fetchUserData]),
    )

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            router.replace('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#344939" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ваш кабінет</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push("/(authenticated)/settings")}
                    >
                        <Settings size={24} color="#344939" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleLogout}
                    >
                        <LogOut size={24} color="#344939" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{userData?.nickname.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{userData?.nickname}</Text>
                        <Text style={styles.email}>{userData?.email}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.specialization}>
                        <Text style={styles.sectionTitle}>Рекомендована спеціалізація</Text>
                        <Text style={styles.specializationText}>Назва спеціальності</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.coursesList}>
                        <Text style={styles.sectionTitle}>Рекомендований курс</Text>
                        <View style={{ width: '90%', height: 1, backgroundColor: '#344939CC', marginVertical: 20 }} />
                        <Text style={styles.sectionTitle}>Поточний прогрес</Text>
                        {courses.map((course, index) => (
                            <View key={index} style={styles.courseItem}>
                                <Text style={styles.courseName}>{course.name}</Text>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${course.progress}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>{course.progress}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#CCD4C5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CCD4C5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CCD4C5',
        padding: 20,
    },
    errorText: {
        color: '#344939',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#344939',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#CCD4C5',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 55,
        padding: 16,
        backgroundColor: '#A9B4AC',
        borderBottomWidth: 1,
        borderBottomColor: '#6A776D',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#344939',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#A9B4AC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        color: '#344939',
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#344939',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#6A776D',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#6A776D',
        marginBottom: 11,
    },
    specialization: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#A9B4AC',
        borderRadius: 8,
        padding: 16,
    },
    specializationText: {
        fontSize: 16,
        color: '#344939',
    },
    coursesList: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#A9B4AC',
        borderRadius: 8,
        padding: 16,
    },
    courseItem: {
        height: 50,
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        padding: 10,
        borderRadius: 5,
    },
    courseName: {
        fontSize: 16,
        color: '#344939',
        marginBottom: 8,
    },
    progressBar: {
        width: '50%',
        height: 16,
        backgroundColor: '#CCD4C5',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#344939',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#6A776D',
        textAlign: 'right',
    },
});

