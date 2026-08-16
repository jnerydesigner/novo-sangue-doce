package br.com.sanguedoce.app.service

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.TodayResponse
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

private const val UploadReadingImageLogTag = "UploadReadingImage"

class UploadReadingImageService(
    private val context: Context
) {

    suspend fun execute(imageUri: Uri): TodayResponse {
        val contentResolver = context.contentResolver
        val rawMimeType = contentResolver.getType(imageUri)
        val mimeType = normalizeImageMimeType(rawMimeType)
        val fileName = normalizeFileName(
            fileName = getDisplayName(imageUri),
            mimeType = mimeType
        )
        val bytes = contentResolver.openInputStream(imageUri)?.use { inputStream ->
            inputStream.readBytes()
        } ?: throw IllegalArgumentException("Nao foi possivel ler a imagem.")

        Log.i(
            UploadReadingImageLogTag,
            "Enviando print de medicao. uri=$imageUri rawMimeType=$rawMimeType mimeType=$mimeType fileName=$fileName bytes=${bytes.size}"
        )

        val requestBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
        val imagePart = MultipartBody.Part.createFormData(
            name = "image",
            filename = fileName,
            body = requestBody
        )

        val response = RetrofitClient.api.createMeasurementFromImage(imagePart)
        Log.i(
            UploadReadingImageLogTag,
            "Backend importou print com sucesso. id=${response.id} measuredAt=${response.measuredAt} glucoseValueMgDl=${response.glucoseValueMgDl} readingContext=${response.readingContext} source=${response.source} noteType=${response.noteType} noteLabel=${response.noteLabel}"
        )

        return response
    }

    private fun getDisplayName(uri: Uri): String? {
        return context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (nameIndex >= 0 && cursor.moveToFirst()) {
                cursor.getString(nameIndex)
            } else {
                null
            }
        }
    }

    private fun normalizeImageMimeType(mimeType: String?): String {
        return when (mimeType?.lowercase()) {
            "image/png" -> "image/png"
            "image/webp" -> "image/webp"
            "image/jpg",
            "image/jpeg" -> "image/jpeg"
            else -> "image/jpeg"
        }
    }

    private fun normalizeFileName(fileName: String?, mimeType: String): String {
        val extension = when (mimeType) {
            "image/png" -> ".png"
            "image/webp" -> ".webp"
            else -> ".jpg"
        }
        val cleanFileName = fileName
            ?.substringAfterLast("/")
            ?.takeIf { it.isNotBlank() }
            ?: "measurement$extension"

        return if (cleanFileName.contains(".")) {
            cleanFileName
        } else {
            "$cleanFileName$extension"
        }
    }
}
