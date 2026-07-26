package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.databinding.ActivityLoginBinding
import br.com.sanguedoce.app.model.LoginRequest
import kotlinx.coroutines.launch


class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        if (AuthSession.isLoggedIn(this)) { openMain(); return }
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.hide()
        binding.btnLoginPersonal.setOnClickListener { login() }
    }
    private fun login() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()
        if (email.isBlank() || password.isBlank()) { binding.tvError.text = getString(R.string.login_required_fields); return }
       lifecycleScope.launch {
           try{
               val response = RetrofitClient.api.login(
                   LoginRequest(
                       email = email,
                       password = password
                   )
               )

               println(response.accessToken)

               RetrofitClient.setToken(response.accessToken)


               AuthSession.signIn(this@LoginActivity, response.accessToken, email)

               openMain()

           } catch(erro: Exception){
               binding.tvError.text = "Erro ao conectar com o servidor"
               Toast.makeText(
                   this@LoginActivity,
                   "Não foi possível fazer login",
                   Toast.LENGTH_SHORT
               ).show()

           }
       }
    }
    private fun openMain() {
        startActivity(Intent(this, MeasurementsTodayActivity::class.java))
        finish()
    }

}
