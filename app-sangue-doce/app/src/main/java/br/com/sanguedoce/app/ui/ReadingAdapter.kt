package br.com.sanguedoce.app.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import br.com.sanguedoce.app.databinding.ItemReadingBinding
import br.com.sanguedoce.app.model.GlucoseReading

class ReadingAdapter(private var readings: List<GlucoseReading>) :
    RecyclerView.Adapter<ReadingAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemReadingBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemReadingBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val reading = readings[position]

        holder.binding.apply {
            tvValue.text = reading.value.toString()
            tvMealType.text = "Medição" // Ou remova se preferir
            
            // Formata o measuredAt (ex: 2026-07-26T10:25:59.467Z)
            tvDate.text = reading.measuredAt
                .substringAfter("T")
                .substringBeforeLast(":")
        }
    }

    override fun getItemCount() = readings.size

    fun updateData(newReadings: List<GlucoseReading>) {
        readings = newReadings
        notifyDataSetChanged()
    }
}
