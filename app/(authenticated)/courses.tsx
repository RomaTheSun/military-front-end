import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CoursesScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Курси</Text>
            </View>
            <View style={styles.content}>
                <Text>Courses content will go here</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#CCD4C5',
    },
    header: {
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
    content: {
        flex: 1,
        padding: 16,
    },
});

