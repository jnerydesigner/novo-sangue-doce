package br.com.sanguedoce.app.ui.drawer

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import br.com.sanguedoce.app.model.ProfileResponse


@Preview(
    showBackground = true,
    widthDp = 360
)
@Composable
private fun DrawerUserHeaderPreview() {
    MaterialTheme {
        DrawerUserHeader(
            profile = ProfileResponse(
                sub = "d9a85bb2-9ec7-43c6-9650-cab0fa057b7f",
                name = "Jander da Costa Nery",
                email = "jander.webmaster@gmail.com",
                avatarUrl = "/public/users/jander-nery/d9a85bb2-9ec7-43c6-9650-cab0fa057b7f.webp",
                birthDate = "23/01/1978",
                diabetesType = "Diabetes tipo 1",
                role = "ADMIN",
                roles = listOf("ADMIN"),
                passwordSetupRequired = false,
                createdAt = "28/06/2026",
                updatedAt = "28/06/2026"
            )
        )
    }
}
