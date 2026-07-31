package br.com.sanguedoce.app

import android.content.Context
import android.util.Base64
import org.json.JSONObject

object AuthSession {

    private const val PREFS = "auth_session"
    private const val TOKEN = "access_token"
    private const val KEY_EMAIL = "email"

    fun signIn(
        context: Context,
        token: String,
        email: String
    ) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(TOKEN, token)
            .putString(KEY_EMAIL, email)
            .apply()
    }

    fun getToken(context: Context): String? {
        return context
            .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(TOKEN, null)
    }

    fun signOut(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply()
    }

    fun isTokenExpired(token: String): Boolean {
        return try {
            val parts = token.split(".")

            if (parts.size != 3) {
                return true
            }

            val decodedPayload = Base64.decode(
                parts[1],
                Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP
            )

            val json = JSONObject(
                String(decodedPayload, Charsets.UTF_8)
            )

            val expiration = json.getLong("exp")
            val currentTime = System.currentTimeMillis() / 1000

            currentTime >= expiration

        } catch (e: Exception) {
            true
        }
    }

    fun isLoggedIn(context: Context): Boolean {
        val token = getToken(context) ?: return false
        return !isTokenExpired(token)
    }

    fun getEmail(context: Context): String? {
        return context
            .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_EMAIL, null)
    }
}