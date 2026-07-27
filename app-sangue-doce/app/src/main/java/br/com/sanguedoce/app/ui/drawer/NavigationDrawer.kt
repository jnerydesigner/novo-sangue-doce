package br.com.sanguedoce.app.ui.drawer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Article
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MonitorHeart
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.sanguedoce.app.ui.ProfileUiState

@Composable
fun NavigationDrawer(
    profileState: ProfileUiState,
    selectedItem: String,
    onItemClick: (String) -> Unit,
    onLogoutClick: () -> Unit,
    onRetryProfile: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .fillMaxWidth(0.85f)
            .background(MaterialTheme.colorScheme.surface)
    ) {
        DrawerHeader(
            state = profileState,
            onRetry = onRetryProfile
        )

        HorizontalDivider()

        Spacer(modifier = Modifier.height(12.dp))

        NavigationDrawerItem(
            label = {
                Text("Início")
            },
            selected = selectedItem == "home",
            onClick = {
                onItemClick("home")
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = "Início"
                )
            },
            modifier = Modifier.padding(
                horizontal = 12.dp,
                vertical = 4.dp
            )
        )

        NavigationDrawerItem(
            label = {
                Text("Minhas glicemias")
            },
            selected = selectedItem == "glucose",
            onClick = {
                onItemClick("glucose")
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.MonitorHeart,
                    contentDescription = "Minhas glicemias"
                )
            },
            modifier = Modifier.padding(
                horizontal = 12.dp,
                vertical = 4.dp
            )
        )

        NavigationDrawerItem(
            label = {
                Text("Artigos")
            },
            selected = selectedItem == "articles",
            onClick = {
                onItemClick("articles")
            },
            icon = {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Article,
                    contentDescription = "Artigos"
                )
            },
            modifier = Modifier.padding(
                horizontal = 12.dp,
                vertical = 4.dp
            )
        )

        NavigationDrawerItem(
            label = {
                Text("Meu perfil")
            },
            selected = selectedItem == "profile",
            onClick = {
                onItemClick("profile")
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Meu perfil"
                )
            },
            modifier = Modifier.padding(
                horizontal = 12.dp,
                vertical = 4.dp
            )
        )

        NavigationDrawerItem(
            label = {
                Text("Configurações")
            },
            selected = selectedItem == "settings",
            onClick = {
                onItemClick("settings")
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Configurações"
                )
            },
            modifier = Modifier.padding(
                horizontal = 12.dp,
                vertical = 4.dp
            )
        )

        Spacer(modifier = Modifier.weight(1f))

        HorizontalDivider()

        NavigationDrawerItem(
            label = {
                Text("Sair")
            },
            selected = false,
            onClick = onLogoutClick,
            icon = {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                    contentDescription = "Sair"
                )
            },
            colors = NavigationDrawerItemDefaults.colors(
                unselectedIconColor = MaterialTheme.colorScheme.error,
                unselectedTextColor = MaterialTheme.colorScheme.error
            ),
            modifier = Modifier
                .navigationBarsPadding()
                .padding(
                    horizontal = 12.dp,
                    vertical = 12.dp
                )
        )
    }
}


@Preview(
    showBackground = true,
    widthDp = 360,
    heightDp = 800
)
@Composable
private fun NavigationDrawerPreview() {
    MaterialTheme {
        NavigationDrawer(
            profileState = ProfileUiState.Loading,
            selectedItem = "glucose",
            onItemClick = {},
            onLogoutClick = {},
            onRetryProfile = {}
        )
    }
}