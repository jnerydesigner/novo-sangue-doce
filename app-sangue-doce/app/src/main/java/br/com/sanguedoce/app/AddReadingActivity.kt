package br.com.sanguedoce.app

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import br.com.sanguedoce.app.databinding.ActivityAddReadingBinding
import br.com.sanguedoce.app.service.SaveReadingService
import kotlinx.coroutines.launch


class AddReadingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddReadingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddReadingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        title = "Nova Medição"


        binding.btnSave.setOnClickListener {
            saveReading()
        }
    }



    private fun saveReading() {
        val valueStr = binding.etValue.text.toString()
        val value = valueStr.toIntOrNull()

        if (value == null) {
            Toast.makeText(this, "Por favor, insira um valor válido", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                SaveReadingService(this@AddReadingActivity).execute(value)
                Toast.makeText(this@AddReadingActivity, "Medição salva com sucesso", Toast.LENGTH_SHORT).show()
                finish()
            } catch (e: Exception) {
                Toast.makeText(this@AddReadingActivity, "Erro ao salvar: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }


}
