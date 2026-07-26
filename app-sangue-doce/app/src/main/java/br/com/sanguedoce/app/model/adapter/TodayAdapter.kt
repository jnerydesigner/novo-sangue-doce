package br.com.sanguedoce.app.model.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import br.com.sanguedoce.app.model.TodayResponse
import br.com.sanguedoce.app.R

class TodayAdapter(
    private val measurements: List<TodayResponse>
) : RecyclerView.Adapter<TodayAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val noteLabel: TextView = view.findViewById(R.id.tvNoteLabel)
        val value: TextView = view.findViewById(R.id.tvValue)
        val date: TextView = view.findViewById(R.id.tvDate)
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_measurement_today, parent, false)

        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val measurement = measurements[position]

        holder.noteLabel.text = measurement.noteLabel
        holder.value.text = "${measurement.glucoseValueMgDl} mg/dL"
        holder.date.text = measurement.measuredAt
            .substringAfter("T")
            .substringBefore(".")
            .removeSuffix("Z")
            .substringBeforeLast(":")

    }

    override fun getItemCount(): Int = measurements.size
}
