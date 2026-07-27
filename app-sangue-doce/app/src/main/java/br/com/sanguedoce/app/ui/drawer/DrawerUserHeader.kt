package br.com.sanguedoce.app.ui.drawer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import br.com.sanguedoce.app.model.ProfileResponse
import br.com.sanguedoce.app.ui.SangueDocePrimary
import coil3.compose.AsyncImage

private const val S3_BASE_URL =
    "https://sangue-doce.s3.us-east-1.amazonaws.com"

@Composable
fun DrawerUserHeader(
    profile: ProfileResponse,
    modifier: Modifier = Modifier
) {
    val avatarUrl = profile.avatarUrl
        .takeIf { it.isNotBlank() }
        ?.let { path ->
            if (
                path.startsWith("http://") ||
                path.startsWith("https://")
            ) {
                path
            } else {
                "$S3_BASE_URL/${path.trimStart('/')}"
            }
        }

    var avatarLoadFailed by remember(avatarUrl) {
        mutableStateOf(false)
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(SangueDocePrimary)
            .statusBarsPadding()
            .padding(
                horizontal = 20.dp,
                vertical = 32.dp
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (avatarUrl != null && !avatarLoadFailed) {
            AsyncImage(
                model = avatarUrl,
                contentDescription = "Foto de ${profile.name}",
                contentScale = ContentScale.Crop,
                onError = {
                    avatarLoadFailed = true
                },
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(
                        Color.White.copy(alpha = 0.20f)
                    )
            )
        } else {
            DefaultUserAvatar()
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = profile.name,
                color = Color.White,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = profile.email,
                color = Color.White.copy(alpha = 0.85f),
                style = MaterialTheme.typography.bodySmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            profile.diabetesType
                .takeIf { it.isNotBlank() }
                ?.let { diabetesType ->
                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = diabetesType,
                        color = Color.White,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
        }
    }
}

@Composable
private fun DefaultUserAvatar() {
    Column(
        modifier = Modifier
            .size(72.dp)
            .clip(CircleShape)
            .background(
                Color.White.copy(alpha = 0.20f)
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Person,
            contentDescription = "Usuário sem foto",
            tint = Color.White,
            modifier = Modifier.size(42.dp)
        )
    }
}