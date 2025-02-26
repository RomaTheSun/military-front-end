export interface TestQuestion {
    id: string
    question_text: string
    question_options: TestQuestionOption[]
}

export interface TestQuestionOption {
    id: string
    option_text: string
    option_scores: OptionScore[]
}

export interface OptionScore {
    score: number
    profession: MilitaryProfession
}

export type MilitaryProfession =
    | "combat_officer"
    | "logistics_officer"
    | "intelligence_officer"
    | "medical_officer"
    | "engineering_officer"

export interface ProfessionDescription {
    profession: MilitaryProfession
    title: string
    description: string
}

export interface ProfessionTest {
    id: string
    title: string
    description: string
    questions: TestQuestion[]
}

