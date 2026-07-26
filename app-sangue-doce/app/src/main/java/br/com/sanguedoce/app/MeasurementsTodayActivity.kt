package br.com.sanguedoce.app


import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.adapter.TodayAdapter
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MeasurementsTodayActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: TodayAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        supportActionBar?.title = "Leituras de hoje: ${currentDisplayDate()}"


        setContentView(R.layout.activity_measurements_today)

        recyclerView = findViewById(R.id.rvMeasurements)
        recyclerView.layoutManager = LinearLayoutManager(this)
        val fabAddMeasurement =
            findViewById<FloatingActionButton>(R.id.fabAddMeasurement)

        fabAddMeasurement.setOnClickListener {
            startActivity(
                Intent(this, AddReadingActivity::class.java)
            )
        }

        carregarMedicoes()
    }

    override fun onResume() {
        super.onResume()
        carregarMedicoes()
    }

    private fun currentDisplayDate(): String {
        val formatter = SimpleDateFormat(
            "dd/MM/yyyy",
            Locale.getDefault()
        )

        return formatter.format(Date())
    }

    private fun carregarMedicoes() {
        lifecycleScope.launch {
            try {
                val measurements =
                    RetrofitClient.api.getMeasurementsToday()

                adapter = TodayAdapter(measurements)
                recyclerView.adapter = adapter

            } catch (erro: Exception) {
                Toast.makeText(
                    this@MeasurementsTodayActivity,
                    "Erro: ${erro.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}

