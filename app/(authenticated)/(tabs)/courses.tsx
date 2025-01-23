import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
export default function CoursesScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Курси</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.coursesList}>
                    <Text style={styles.sectionTitle}>Рекомендований курс</Text>
                    <View style={{ width: '90%', height: 1, backgroundColor: '#344939CC', marginVertical: 20 }} />
                    <Text style={styles.sectionTitle}>Курси</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#CCD4C5',
    },
    header: {
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
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#6A776D',
        marginBottom: 11,
    },
    coursesList: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 8,
        padding: 16,
    },
    courseItem: {
        backgroundColor: '#A9B4AC',
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

