import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from "../../config"

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store the tokens
            await AsyncStorage.setItem('accessToken', data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.refreshToken);

            // Navigate to the home screen
            router.replace('/(authenticated)/profile');
        } catch (error) {
            let errorMessage = 'An unexpected error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage = error.message as string;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.loginContainer}>
                <Text style={[styles.title, styles.maincolor, styles.baseTextShadow]}>Логін</Text>
                <Text style={[styles.subtitle, styles.maincolor, styles.baseTextShadow]}>Увійдіть у свій обліковий запис</Text>
                <View style={[styles.inputcotainer]}>
                    <Text style={[styles.inputlabel, styles.inputlabelcolor, styles.baseTextShadow]}>
                        Email
                    </Text>
                    <TextInput
                        style={[styles.input, styles.baseShadow]}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={[styles.inputcotainer]}>
                    <Text style={[styles.inputlabel, styles.inputlabelcolor, styles.baseTextShadow]}>
                        Password
                    </Text>
                    <TextInput
                        style={[styles.input, styles.baseShadow]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
                <TouchableOpacity style={[styles.button, styles.baseShadow]} onPress={handleLogin}>
                    {isLoading ? (
                        <ActivityIndicator color="#B7D7BF" />
                    ) : (
                        <Text style={styles.buttonText}>Увійти</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonSm, styles.baseShadow]}>
                    <Text style={styles.buttonTextSm}>Забули пароль</Text>
                </TouchableOpacity>
                <View style={[styles.subtitle, { marginTop: 50, justifyContent: 'center', alignContent: 'center', flexDirection: 'row' }]}>
                    <Text style={styles.baseTextShadow}>Якщо у вас немає акаунту:</Text>
                    <TouchableOpacity style={{ alignContent: "center", justifyContent: "center" }}
                        onPress={() => router.replace('/register')}
                    >
                        <Text style={{ color: '#6A776D', textDecorationStyle: 'solid', textDecorationLine: 'underline', display: 'flex', alignItems: 'center' }}>Зареєструйтесь</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#CCD4C5',
    },
    loginContainer: {
        margin: 20,
    },
    maincolor: {
        color: "#344939",
    },
    baseTextShadow: {
        textShadowColor: "#00000040",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    baseShadow: {
        shadowColor: "#00000040",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    title: {
        fontFamily: 'Inter',
        fontSize: 38,
        fontWeight: 700,
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 46,
    },
    subtitle: {
        fontFamily: 'Inter',
        fontWeight: 500,
        fontSize: 16,
        lineHeight: 19,
        textAlign: 'center',
        marginBottom: 85,
    },
    inputcotainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputlabel: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 18,
        lineHeight: 21,
    },
    inputlabelcolor: {
        color: '#6A776D'
    },
    input: {
        height: 50,
        borderColor: '#6A776D',
        borderWidth: 1,
        padding: 10,
        borderRadius: 15,
        backgroundColor: '#A9B4AC',
        marginBottom: 70,
    },
    button: {
        backgroundColor: '#677466',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonSm: {
        marginTop: 10,
        backgroundColor: '#677466',
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#B7D7BF',
        fontSize: 24,
        fontWeight: 400,
    },
    buttonTextSm: {
        color: '#B7D7BF',
        fontSize: 16,
        fontWeight: 400,
    }
});

