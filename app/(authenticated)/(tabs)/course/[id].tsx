"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Settings, Share2, CheckSquare, Square, LogOut } from "lucide-react-native"
import { apiUrl } from "../../../../config"

interface Chapter {
  id: string
  title: string
  description: string
  order_in_course: number
}

interface Course {
  id: string
  title: string
  description: string
  chapters: Chapter[]
}

interface UserProgress {
  chapter_id: string
  completed: boolean
}

interface ChapterWithProgress extends Chapter {
  progress: number
  isCompleted: boolean
}

export default function CourseScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [chaptersWithProgress, setChaptersWithProgress] = useState<ChapterWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    fetchCourseData()
  }, []) // Removed unnecessary dependency 'id'

  const fetchCourseData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken")
      if (!token) throw new Error("No access token found")

      const [courseResponse, progressResponse] = await Promise.all([
        fetch(`${apiUrl}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/user/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!courseResponse.ok || !progressResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const courseData: Course = await courseResponse.json()
      const progressData: UserProgress[] = await progressResponse.json()

      // Process chapters with progress
      const chaptersProgress = courseData.chapters.map((chapter) => {
        const progress = progressData.find((p) => p.chapter_id === chapter.id)
        return {
          ...chapter,
          progress: progress?.completed ? 100 : 0,
          isCompleted: progress?.completed || false,
        }
      })

      // Calculate overall progress
      const completedChapters = chaptersProgress.filter((chapter) => chapter.isCompleted).length
      const totalProgress = (completedChapters / chaptersProgress.length) * 100

      setCourse(courseData)
      setChaptersWithProgress(chaptersProgress)
      setOverallProgress(totalProgress)
    } catch (error) {
      console.error("Error fetching course data:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
    )
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load course</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Курси: {course.title}</Text>
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
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Пройдено підготовчого матеріалу</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
            <Text style={styles.progressText}>{Math.round(overallProgress)}%</Text>
          </View>
        </View>

        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Текстові матеріали</Text>
          {chaptersWithProgress.map((chapter) => (
            <TouchableOpacity
              key={chapter.id}
              style={styles.chapterItem}
              onPress={() => router.push(`/chapter/${chapter.id}` as RelativePathString)}
            >
              <View style={styles.chapterContent}>
                <Text style={styles.chapterTitle}>
                  {chapter.order_in_course}. {chapter.title}
                </Text>
                <View style={styles.chapterProgress}>
                  <View style={styles.chapterProgressBar}>
                    <View style={[styles.chapterProgressFill, { width: `${chapter.progress}%` }]} />
                    <Text style={styles.chapterProgressText}>{chapter.progress}%</Text>
                  </View>
                  {chapter.isCompleted ? (
                    <CheckSquare size={24} color="#344939" />
                  ) : (
                    <Square size={24} color="#344939" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.finalTest}>
            <Text style={styles.finalTestText}>Фінальний тест</Text>
            <CheckSquare size={24} color="#344939" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#CCD4C5",
  },
  errorText: {
    color: "#344939",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    padding: 16,
    backgroundColor: "#A9B4AC",
    borderBottomWidth: 1,
    borderBottomColor: "#6A776D",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#344939",
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#A9B4AC",
  },
  progressTitle: {
    fontSize: 16,
    color: "#6A776D",
    marginBottom: 8,
    alignSelf: "center",
  },
  progressBar: {
    height: 16,
    backgroundColor: "#A9B4AC",
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
    position: 'absolute',
    fontSize: 14,
    color: '#6A776D',
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  chaptersSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#6A776D",
    marginBottom: 16,
    alignSelf: "center",
  },
  chapterItem: {
    backgroundColor: "#A9B4AC",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  chapterContent: {
    flexDirection: "column",
    gap: 8,
  },
  chapterTitle: {
    fontSize: 16,
    color: "#344939",
  },
  chapterProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chapterProgressBar: {
    flex: 1,
    height: 16,
    backgroundColor: "#CCD4C5",
    borderRadius: 4,
    overflow: "hidden",
  },
  chapterProgressFill: {
    height: "100%",
    backgroundColor: "#344939",
    borderRadius: 4,
  },
  chapterProgressText: {
    position: 'absolute',
    fontSize: 14,
    color: '#6A776D',
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  finalTest: {
    backgroundColor: "#A9B4AC",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finalTestText: {
    fontSize: 16,
    color: "#344939",
  },
})

