package br.com.sanguedoce.app

import android.content.Context

object AuthSession {
    private const val PREFS = "auth_session"
    private const val TOKEN = "access_token"
    private const val KEY_EMAIL = "email"

    fun isLoggedIn(context: Context): Boolean {
        return getToken(context) != null
    }

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

}
