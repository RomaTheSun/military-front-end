"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { Settings, Share2, CheckSquare, Square, RotateCcw } from "lucide-react-native"
import { useRouter } from "expo-router"
import { testQuestions, type MilitaryProfession, professionDescriptions } from "../../../types/profession-test"

interface Answer {
    questionId: number
    optionId: number
}

export default function ProfessionTestScreen() {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [isComplete, setIsComplete] = useState(false)
    const [aiSuggestions, setAiSuggestions] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

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
        setAiSuggestions(null)
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
            completeTest()
        }
    }

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const completeTest = async () => {
        setIsLoading(true)
        setIsComplete(true)

        try {
            const response = await fetch("/api/evaluate-profession", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ answers }),
            })

            if (!response.ok) {
                throw new Error("Failed to get AI suggestions")
            }

            const data = await response.json()
            setAiSuggestions(data.suggestions)
        } catch (error) {
            console.error("Error getting AI suggestions:", error)
            // Handle error (e.g., show an error message to the user)
        } finally {
            setIsLoading(false)
        }
    }

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
                    <Text style={styles.headerTitle}>Результати тесту</Text>
                    <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
                        <RotateCcw size={24} color="#344939" />
                        <Text style={styles.retakeButtonText}>Пройти тест знову</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.content}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#344939" />
                    ) : (
                        <>
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
                            {aiSuggestions && (
                                <View style={styles.aiSuggestionsContainer}>
                                    <Text style={styles.aiSuggestionsTitle}>AI-рекомендації:</Text>
                                    <Text style={styles.aiSuggestionsText}>{aiSuggestions}</Text>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Курси</Text>
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
                        <Text style={styles.navButtonText}>
                            {currentQuestionIndex === testQuestions.length - 1 ? "Завершити тест" : "Наступне запитання"}
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
        marginBottom: 12,
    },
    retakeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#CCD4C5",
        padding: 12,
        borderRadius: 8,
        alignSelf: "flex-start",
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
    aiSuggestionsContainer: {
        backgroundColor: "#A9B4AC",
        borderRadius: 8,
        padding: 16,
        marginTop: 24,
    },
    aiSuggestionsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#344939",
        marginBottom: 8,
    },
    aiSuggestionsText: {
        fontSize: 14,
        color: "#344939",
        lineHeight: 20,
    },
})

