package br.com.sanguedoce.app.libs;

fun hexToArgb(hex: String): Long {
    val clean = hex.removePrefix("#")

    require(clean.length == 6 || clean.length == 8) {
        "Cor inválida: use #RRGGBB ou #AARRGGBB"
    }

    val argb = if (clean.length == 6) {
        "FF$clean"
    } else {
        clean
    }

    return argb.toLong(16)
}
