import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiUrl } from "../../config"
import { ArrowLeft } from "lucide-react-native"
import { useNavigation } from "expo-router"

interface UserData {
    id: string
    nickname: string
    email: string
}

export default function SettingsScreen() {
    const router = useRouter()
    const navigation = useNavigation()
    const [nickname, setNickname] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [userData, setUserData] = useState<UserData | null>(null)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken")
            if (!token) {
                throw new Error("No access token found")
            }

            const response = await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch user data")
            }

            const data = await response.json()
            setUserData(data)
            setNickname(data.nickname)
        } catch (error) {
            Alert.alert("Error", "Failed to load user data")
        }
    }

    const handleUpdateNickname = async () => {
        if (!nickname.trim()) {
            Alert.alert("Error", "Please enter a nickname")
            return
        }

        setIsLoading(true)

        try {
            const token = await AsyncStorage.getItem("accessToken")
            if (!token) {
                throw new Error("No access token found")
            }

            const response = await fetch(`${apiUrl}/user/nickname`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nickname }),
            })

            if (!response.ok) {
                throw new Error("Failed to update nickname")
            }

            Alert.alert("Success", "Nickname updated successfully")
        } catch (error) {
            Alert.alert("Error", "Failed to update nickname")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!userData?.email) {
            Alert.alert("Error", "Email not found")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${apiUrl}/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userData.email }),
            })

            if (!response.ok) {
                throw new Error("Failed to send reset password email")
            }

            Alert.alert("Success", "Password reset email has been sent")
        } catch (error) {
            Alert.alert("Error", "Failed to send reset password email")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#344939" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Налаштування</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Змінити Нікнейм</Text>
                    <TextInput
                        style={styles.input}
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Username"
                        editable={!isLoading}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Змінити пароль</Text>
                    <Text style={styles.description}>
                        Натискаючи кнопку, ви погоджуєтеся на отримання електронного листа для зміни паролю. Якщо лист не надійде,
                        перевірте папку "Spam" або зверніться в підтримку.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Надіслати</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                    onPress={handleUpdateNickname}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Зберегти зміни</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#CCD4C5",
    },
    header: {
        paddingTop: 55,
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#A9B4AC",
        borderBottomWidth: 1,
        borderBottomColor: "#6A776D",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#344939',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
    },
    section: {
        backgroundColor: "#A9B4AC",
        borderRadius: 15,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "500",
        color: "#344939",
        marginBottom: 16,
    },
    input: {
        height: 50,
        backgroundColor: "#CCD4C5",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#344939",
    },
    description: {
        fontSize: 14,
        color: "#6A776D",
        marginBottom: 16,
        lineHeight: 20,
    },
    button: {
        backgroundColor: "#344939",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#344939",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: "auto",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#CCD4C5",
        fontSize: 16,
        fontWeight: "500",
    },
    backButton: {
        marginRight: 16,
    },
})

