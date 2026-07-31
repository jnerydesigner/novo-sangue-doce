package br.com.sanguedoce.app.constants


enum class MeasurementNoteType(
    val label: String
) {
    FASTING_WAKE_UP("Jejum ao acordar"),
    BEFORE_BREAKFAST("Antes do café da manhã"),
    AFTER_BREAKFAST("Após o café da manhã"),
    MORNING_RANDOM_CHECK("Medição aleatória pela manhã"),
    BEFORE_LUNCH("Antes do almoço"),
    AFTER_LUNCH("Após o almoço"),
    AFTERNOON_RANDOM_CHECK("Medição aleatória à tarde"),
    BEFORE_DINNER("Antes do jantar"),
    AFTER_DINNER("Após o jantar"),
    BEFORE_SLEEP("Antes de dormir"),
    NIGHT_RANDOM_CHECK("Medição aleatória à noite"),
    BEFORE_EXERCISE("Antes do exercício"),
    AFTER_EXERCISE("Após o exercício"),
    FEELING_UNWELL("Não estou me sentindo bem"),
    ROUTINE_CHECK("Medição de rotina"),
    DAWN_RANDOM_CHECK("Medição aleatória de madrugada");

    companion object {
        fun fromName(name: String?): MeasurementNoteType? {
            return entries.firstOrNull { it.name == name }
        }
    }
}