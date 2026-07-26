package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import br.com.sanguedoce.app.databinding.ActivityMainBinding
import br.com.sanguedoce.app.ui.ReadingAdapter

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var adapter: ReadingAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!AuthSession.isLoggedIn(this)) { startActivity(Intent(this, LoginActivity::class.java)); finish(); return }
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupListeners()
    }

    override fun onResume() {
        super.onResume()
//        adapter.updateData(GlucoseRepository.getAllReadings())
    }

    private fun setupRecyclerView() {
//        adapter = ReadingAdapter(GlucoseRepository.getAllReadings())
        binding.rvReadings.adapter = adapter
    }

    private fun setupListeners() {
        binding.fabAdd.setOnClickListener {
            startActivity(Intent(this, AddReadingActivity::class.java))
        }
    }
}
