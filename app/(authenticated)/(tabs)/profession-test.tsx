"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { Settings, Share2, CheckSquare, Square, RotateCcw, LogOut } from "lucide-react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiUrl } from "../../../config"
import type { ProfessionTest, ProfessionDescription, MilitaryProfession } from "../../../types/profession-test"

interface Answer {
    questionId: string
    optionId: string
}

export default function ProfessionTestScreen() {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [isComplete, setIsComplete] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [professionTest, setProfessionTest] = useState<ProfessionTest | null>(null)
    const [professionDescriptions, setProfessionDescriptions] = useState<ProfessionDescription[]>([])

    useEffect(() => {
        fetchTestData()
    }, [])

    const fetchTestData = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const token = await AsyncStorage.getItem("accessToken")
            if (!token) throw new Error("No access token found")

            const [testResponse, descriptionsResponse] = await Promise.all([
                fetch(`${apiUrl}/profession-tests/bc1c1aaa-a2f4-40b2-a01b-7c67fe8ac8ea`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${apiUrl}/profession_descriptions`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])

            if (!testResponse.ok || !descriptionsResponse.ok) {
                throw new Error("Failed to fetch data")
            }

            const testData: ProfessionTest = await testResponse.json()
            const descriptionsData: ProfessionDescription[] = await descriptionsResponse.json()

            setProfessionTest(testData)
            setProfessionDescriptions(descriptionsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnswer = (optionId: string) => {
        const newAnswers = [...answers]
        const existingAnswerIndex = newAnswers.findIndex(
            (a) => a.questionId === professionTest?.questions[currentQuestionIndex].id,
        )

        if (existingAnswerIndex !== -1) {
            newAnswers[existingAnswerIndex] = {
                questionId: professionTest!.questions[currentQuestionIndex].id,
                optionId,
            }
        } else {
            newAnswers.push({
                questionId: professionTest!.questions[currentQuestionIndex].id,
                optionId,
            })
        }

        setAnswers(newAnswers)
    }

    const resetTest = () => {
        setCurrentQuestionIndex(0)
        setAnswers([])
        setIsComplete(false)
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

    const calculateResults = () => {
        const scores: Record<MilitaryProfession, number> = {
            combat_officer: 0,
            logistics_officer: 0,
            intelligence_officer: 0,
            medical_officer: 0,
            engineering_officer: 0,
        }

        answers.forEach((answer) => {
            const question = professionTest?.questions.find((q) => q.id === answer.questionId)
            const option = question?.question_options.find((o) => o.id === answer.optionId)

            if (option) {
                option.option_scores.forEach(({ profession, score }) => {
                    scores[profession] += score
                })
            }
        })

        const total = Object.values(scores).reduce((a, b) => a + b, 0)
        const percentages = Object.entries(scores).reduce(
            (acc, [profession, score]) => ({
                ...acc,
                [profession]: Math.round((score / total) * 100),
            }),
            {} as Record<MilitaryProfession, number>,
        )

        return percentages
    }

    const goToNextQuestion = () => {
        if (currentQuestionIndex < (professionTest?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
            setIsComplete(true)
        }
    }

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#344939" />
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchTestData}>
                    <Text style={styles.retryButtonText}>Спробувати знову</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (!professionTest) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Не вдалося завантажити тест</Text>
            </View>
        )
    }

    const currentQuestion = professionTest.questions[currentQuestionIndex]
    const selectedOptionId = answers.find((a) => a.questionId === currentQuestion.id)?.optionId

    if (isComplete) {
        const results = calculateResults()
        const sortedResults = Object.entries(results)
            .sort(([, a], [, b]) => b - a)
            .map(([profession, percentage]) => ({
                profession: profession as MilitaryProfession,
                percentage,
            }))

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Результати Тесту</Text>
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
                <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
                    <RotateCcw size={24} color="#344939" />
                    <Text style={styles.retakeButtonText}>Пройти тест знову</Text>
                </TouchableOpacity>
                    <Text style={styles.resultsTitle}>Ваші результати показують наступну сумісність:</Text>
                    {sortedResults.map(({ profession, percentage }) => {
                        const description = professionDescriptions.find((desc) => desc.profession === profession)
                        return (
                            <View key={profession} style={styles.resultItem}>
                                <Text style={styles.professionTitle}>{description?.title || profession}</Text>
                                <Text style={styles.professionDescription}>{description?.description || "Опис недоступний"}</Text>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                                </View>
                                <Text style={styles.percentageText}>{percentage}%</Text>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Тест</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Settings size={24} color="#344939" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={24} color="#344939" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.questionNumber}>
                    Запитання {currentQuestionIndex + 1} з {professionTest.questions.length}
                </Text>
                <View style={styles.questionCard}>
                    <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
                </View>

                {currentQuestion.question_options.map((option) => (
                    <TouchableOpacity key={option.id} style={styles.optionButton} onPress={() => handleAnswer(option.id)}>
                        <Text style={styles.optionText}>{option.option_text}</Text>
                        {selectedOptionId === option.id ? (
                            <CheckSquare size={24} color="#344939" />
                        ) : (
                            <Square size={24} color="#344939" />
                        )}
                    </TouchableOpacity>
                ))}

                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
                        onPress={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        <Text style={styles.navButtonText}>Попереднє запитання</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navButton, !selectedOptionId && styles.navButtonDisabled]}
                        onPress={goToNextQuestion}
                        disabled={!selectedOptionId}
                    >
                        <Text style={styles.navButtonText}>
                            {currentQuestionIndex === professionTest.questions.length - 1 ? "Завершити тест" : "Наступне запитання"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: "#344939",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: "#344939",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#CCD4C5",
        fontSize: 16,
        fontWeight: "500",
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
        fontWeight: "600",
        color: "#344939",
        marginBottom: 12,
    },
    retakeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#A9B4AC",
        padding: 12,
        borderRadius: 8,
        alignSelf: "center",
    },
    retakeButtonText: {
        color: "#344939",
        fontSize: 16,
        fontWeight: "500",
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
        padding: 16,
    },
    questionNumber: {
        fontSize: 20,
        color: "#6A776D",
        marginBottom: 16,
    },
    questionCard: {
        backgroundColor: "#A9B4AC",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    questionText: {
        fontSize: 18,
        color: "#344939",
    },
    optionButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#A9B4AC",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    optionText: {
        fontSize: 16,
        color: "#344939",
        flex: 1,
        marginRight: 12,
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: "auto",
        gap: 12,
    },
    navButton: {
        flex: 1,
        backgroundColor: "#344939",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        color: "#CCD4C5",
        fontSize: 16,
        fontWeight: "500",
    },
    resultsTitle: {
        fontSize: 18,
        color: "#344939",
        marginBottom: 24,
    },
    resultItem: {
        backgroundColor: "#A9B4AC",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    professionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#344939",
        marginBottom: 8,
    },
    professionDescription: {
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
    percentageText: {
        fontSize: 14,
        color: "#6A776D",
        textAlign: "right",
    },
})

