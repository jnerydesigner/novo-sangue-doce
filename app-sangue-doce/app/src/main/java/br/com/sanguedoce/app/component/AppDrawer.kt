package br.com.sanguedoce.app.component


import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import br.com.sanguedoce.app.ui.drawer.DrawerViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.sanguedoce.app.ui.drawer.NavigationDrawer


@Composable
fun AppDrawer(
    selectedItem: String,
    onItemClick: (String) -> Unit,
    onLogoutClick: () -> Unit,
    modifier: Modifier = Modifier,
    drawerViewModel: DrawerViewModel = viewModel()
) {
    val profileState by drawerViewModel.profileState
        .collectAsStateWithLifecycle()

    NavigationDrawer(
        profileState = profileState,
        selectedItem = selectedItem,
        onItemClick = onItemClick,
        onLogoutClick = onLogoutClick,
        onRetryProfile = drawerViewModel::loadProfile,
        modifier = modifier
    )
}