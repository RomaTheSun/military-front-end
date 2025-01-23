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
    ScrollView,
    Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { apiUrl } from "../../config"

export default function RegisterScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
    });
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleRegister = async () => {
        // Validate form
        if (!formData.username || !formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (formData.password !== formData.repeatPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nickname: formData.username,
                    email: formData.email,
                    password: formData.password,
                    birth_date: date.toISOString().split('T')[0],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            Alert.alert('Success', 'Registration successful', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/login'),
                },
            ]);
        } catch (error) {
            let errorMessage = 'An unexpected error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };


    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.registerContainer}>
                    <Text style={[styles.title, styles.maincolor, styles.baseTextShadow]}>
                        Registration
                    </Text>
                    <Text style={[styles.subtitle, styles.maincolor, styles.baseTextShadow]}>
                        Створіть обліковий запис для проходження військового тестування
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, styles.inputLabelColor, styles.baseTextShadow]}>
                            Username
                        </Text>
                        <TextInput
                            style={[styles.input, styles.baseShadow]}
                            value={formData.username}
                            onChangeText={(text) => setFormData({ ...formData, username: text })}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, styles.inputLabelColor, styles.baseTextShadow]}>
                            Email
                        </Text>
                        <TextInput
                            style={[styles.input, styles.baseShadow]}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, styles.inputLabelColor, styles.baseTextShadow]}>
                            Date of Birth
                        </Text>
                        <TouchableOpacity
                            style={[styles.input, styles.baseShadow, styles.dateInput]}
                            onPress={showDatepicker}
                        >
                            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode="date"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
                            textColor={Platform.OS === 'ios' ? '#344939' : undefined}
                            onChange={onDateChange}
                            style={Platform.OS === 'ios' ? {
                                backgroundColor: '#A9B4AC',
                                height: 200,
                            } : undefined}
                        />
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, styles.inputLabelColor, styles.baseTextShadow]}>
                            Password
                        </Text>
                        <TextInput
                            style={[styles.input, styles.baseShadow]}
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, styles.inputLabelColor, styles.baseTextShadow]}>
                            Repeat Password
                        </Text>
                        <TextInput
                            style={[styles.input, styles.baseShadow]}
                            value={formData.repeatPassword}
                            onChangeText={(text) => setFormData({ ...formData, repeatPassword: text })}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.baseShadow, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Зареєструватись</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.replace('/login')}
                        disabled={isLoading}
                    >
                        <Text style={[styles.loginLinkText, styles.baseTextShadow]}>
                            Маєте акаунт
                        </Text>
                    </TouchableOpacity>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    registerContainer: {
        margin: 20,
        paddingTop: 40
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
        elevation: 4,
    },
    title: {
        fontSize: 38,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '400',
        marginBottom: 5,
    },
    inputLabelColor: {
        color: '#6A776D',
    },
    input: {
        height: 50,
        borderColor: '#6A776D',
        borderWidth: 1,
        padding: 10,
        borderRadius: 15,
        backgroundColor: '#A9B4AC',
        justifyContent: 'center',
    },
    dateInput: {
        backgroundColor: '#A9B4AC',
        borderRadius: 15,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    dateText: {
        color: '#344939',
        fontSize: 16,
    },
    formattedDateContainer: {
        backgroundColor: '#A9B4AC80',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        marginTop: 8,
        marginBottom: 20,
    },
    formattedDate: {
        color: '#344939',
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#677466',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#B7D7BF',
        fontSize: 24,
        fontWeight: '400',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#6A776D',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

