"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiUrl } from "../../../config"

interface Course {
    id: string
    title: string
    description: string
}

interface UserProgress {
    user_id: string
    course_id: string
    chapter_id: string
    completed: boolean
}

interface CourseWithProgress extends Course {
    progress: number
}

export default function CoursesScreen() {
    const [courses, setCourses] = useState<CourseWithProgress[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchCoursesAndProgress()
    }, [])

    const fetchCoursesAndProgress = async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken")
            if (!token) throw new Error("No access token found")

            const [coursesResponse, progressResponse] = await Promise.all([
                fetch(`${apiUrl}/courses`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${apiUrl}/user/progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            if (!coursesResponse.ok || !progressResponse.ok) {
                throw new Error("Failed to fetch data")
            }

            const coursesData: Course[] = await coursesResponse.json()
            const progressData: UserProgress[] = await progressResponse.json()

            const coursesWithProgress = coursesData.map((course) => {
                const courseProgress = progressData.filter((p) => p.course_id === course.id)
                const completedChapters = courseProgress.filter((p) => p.completed).length
                const progress = courseProgress.length > 0 ? (completedChapters / courseProgress.length) * 100 : 0
                return { ...course, progress }
            })

            setCourses(coursesWithProgress)
        } catch (error) {
            console.error("Error fetching courses and progress:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const renderCourseItem = ({ item }: { item: CourseWithProgress }) => (
        <TouchableOpacity style={styles.courseItem} onPress={() => router.push(`/course/${item.id}`)}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.courseDescription}>{item.description}</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{`${Math.round(item.progress)}% completed`}</Text>
        </TouchableOpacity>
    )

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#344939" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Курси</Text>
            </View>
            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.coursesList}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#CCD4C5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#CCD4C5",
    },
    header: {
        padding: 16,
        backgroundColor: "#A9B4AC",
        borderBottomWidth: 1,
        borderBottomColor: "#6A776D",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#344939",
    },
    coursesList: {
        padding: 16,
    },
    courseItem: {
        backgroundColor: "#A9B4AC",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#344939",
        marginBottom: 8,
    },
    courseDescription: {
        fontSize: 14,
        color: "#6A776D",
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#CCD4C5",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 4,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#344939",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: "#6A776D",
        textAlign: "right",
    },
})

