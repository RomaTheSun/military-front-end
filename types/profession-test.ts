export interface TestQuestion {
    id: number
    text: string
    options: {
        id: number
        text: string
        scores: {
            [key in MilitaryProfession]: number
        }
    }[]
}

export type MilitaryProfession =
    | "combat_officer"
    | "logistics_officer"
    | "intelligence_officer"
    | "medical_officer"
    | "engineering_officer"

export interface ProfessionDescription {
    title: string
    description: string
}

export const professionDescriptions: Record<MilitaryProfession, ProfessionDescription> = {
    combat_officer: {
        title: "Бойовий офіцер",
        description: "Лідер на полі бою, спеціаліст з тактики та стратегії військових операцій.",
    },
    logistics_officer: {
        title: "Офіцер логістики",
        description: "Експерт з планування та забезпечення військових операцій необхідними ресурсами.",
    },
    intelligence_officer: {
        title: "Офіцер розвідки",
        description: "Спеціаліст зі збору та аналізу розвідувальної інформації.",
    },
    medical_officer: {
        title: "Військовий медик",
        description: "Професіонал у наданні медичної допомоги в бойових умовах.",
    },
    engineering_officer: {
        title: "Інженерний офіцер",
        description: "Експерт з військової інженерії та технічного забезпечення.",
    },
}

export const testQuestions: TestQuestion[] = [
    {
        id: 1,
        text: "Як ви зазвичай реагуєте в критичних ситуаціях?",
        options: [
            {
                id: 1,
                text: "Швидко приймаю рішення та дію",
                scores: {
                    combat_officer: 10,
                    logistics_officer: 5,
                    intelligence_officer: 7,
                    medical_officer: 6,
                    engineering_officer: 4,
                },
            },
            {
                id: 2,
                text: "Аналізую ситуацію перед прийняттям рішення",
                scores: {
                    combat_officer: 6,
                    logistics_officer: 8,
                    intelligence_officer: 10,
                    medical_officer: 5,
                    engineering_officer: 7,
                },
            },
            {
                id: 3,
                text: "Шукаю можливості допомогти іншим",
                scores: {
                    combat_officer: 5,
                    logistics_officer: 6,
                    intelligence_officer: 4,
                    medical_officer: 10,
                    engineering_officer: 5,
                },
            },
            {
                id: 4,
                text: "Зосереджуюсь на технічних аспектах проблеми",
                scores: {
                    combat_officer: 4,
                    logistics_officer: 7,
                    intelligence_officer: 6,
                    medical_officer: 5,
                    engineering_officer: 10,
                },
            },
            {
                id: 5,
                text: "Координую дії інших людей",
                scores: {
                    combat_officer: 8,
                    logistics_officer: 10,
                    intelligence_officer: 5,
                    medical_officer: 4,
                    engineering_officer: 6,
                },
            },
        ],
    },
    // Add more questions following the same pattern
    {
        id: 2,
        text: "Що вас найбільше приваблює у військовій службі?",
        options: [
            {
                id: 1,
                text: "Можливість керувати підрозділом",
                scores: {
                    combat_officer: 10,
                    logistics_officer: 8,
                    intelligence_officer: 6,
                    medical_officer: 4,
                    engineering_officer: 5,
                },
            },
            {
                id: 2,
                text: "Робота з військовою технікою",
                scores: {
                    combat_officer: 6,
                    logistics_officer: 5,
                    intelligence_officer: 4,
                    medical_officer: 3,
                    engineering_officer: 10,
                },
            },
            {
                id: 3,
                text: "Планування операцій",
                scores: {
                    combat_officer: 7,
                    logistics_officer: 10,
                    intelligence_officer: 8,
                    medical_officer: 4,
                    engineering_officer: 6,
                },
            },
            {
                id: 4,
                text: "Допомога пораненим",
                scores: {
                    combat_officer: 4,
                    logistics_officer: 5,
                    intelligence_officer: 3,
                    medical_officer: 10,
                    engineering_officer: 4,
                },
            },
            {
                id: 5,
                text: "Збір та аналіз інформації",
                scores: {
                    combat_officer: 5,
                    logistics_officer: 6,
                    intelligence_officer: 10,
                    medical_officer: 4,
                    engineering_officer: 5,
                },
            },
        ],
    },
    // Add more questions as needed
]

