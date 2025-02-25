"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Settings, Share2, CheckSquare, Square, LogOut, RotateCcw } from "lucide-react-native"
import { useRouter } from "expo-router"
import { testQuestions, type MilitaryProfession, professionDescriptions } from "../../../types/profession-test"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Answer {
    questionId: number
    optionId: number
}

export default function ProfessionTestScreen() {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [isComplete, setIsComplete] = useState(false)

    const currentQuestion = testQuestions[currentQuestionIndex]

    const handleAnswer = (optionId: number) => {
        const newAnswers = [...answers]
        const existingAnswerIndex = newAnswers.findIndex((a) => a.questionId === currentQuestion.id)

        if (existingAnswerIndex !== -1) {
            newAnswers[existingAnswerIndex] = {
                questionId: currentQuestion.id,
                optionId,
            }
        } else {
            newAnswers.push({
                questionId: currentQuestion.id,
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
    const calculateResults = () => {
        const scores: Record<MilitaryProfession, number> = {
            combat_officer: 0,
            logistics_officer: 0,
            intelligence_officer: 0,
            medical_officer: 0,
            engineering_officer: 0,
        }

        answers.forEach((answer) => {
            const question = testQuestions.find((q) => q.id === answer.questionId)
            const option = question?.options.find((o) => o.id === answer.optionId)

            if (option) {
                Object.entries(option.scores).forEach(([profession, score]) => {
                    scores[profession as MilitaryProfession] += score
                })
            }
        })

        // Convert to percentages
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
        if (currentQuestionIndex < testQuestions.length - 1) {
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

    const selectedOptionId = answers.find((a) => a.questionId === currentQuestion.id)?.optionId

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            router.replace('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

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
                    {sortedResults.map(({ profession, percentage }) => (
                        <View key={profession} style={styles.resultItem}>
                            <Text style={styles.professionTitle}>{professionDescriptions[profession].title}</Text>
                            <Text style={styles.professionDescription}>{professionDescriptions[profession].description}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                            </View>
                            <Text style={styles.percentageText}>{percentage}%</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Тест</Text>
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

            <View style={styles.content}>
                <Text style={styles.questionNumber}>Запитання {currentQuestionIndex + 1}</Text>
                <View style={styles.questionCard}>
                    <Text style={styles.questionText}>{currentQuestion.text}</Text>
                </View>

                {currentQuestion.options.map((option) => (
                    <TouchableOpacity key={option.id} style={styles.optionButton} onPress={() => handleAnswer(option.id)}>
                        <Text style={styles.optionText}>{option.text}</Text>
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
                        <Text style={styles.navButtonText}>Наступне запитання</Text>
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

