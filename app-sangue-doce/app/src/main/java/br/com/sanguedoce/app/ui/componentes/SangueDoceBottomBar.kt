package br.com.sanguedoce.app.ui.componentes

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Article
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MonitorHeart
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.sanguedoce.app.R
import br.com.sanguedoce.app.ui.SangueDoceBackground
import br.com.sanguedoce.app.ui.SangueDoceBorderColor
import br.com.sanguedoce.app.ui.SangueDoceMutedText
import br.com.sanguedoce.app.ui.SangueDocePrimary

@Composable
fun SangueDoceBottomBar(
    selectedItem: String,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onContentClick: () -> Unit,
    onProfileClick: () -> Unit,
    onBloodClick: (() -> Unit)? = null
) {
    val interactionSource = remember { MutableInteractionSource() }
    val bloodClick = onBloodClick ?: onMeasurementsClick
    val barHorizontalMargin = 12.dp

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(250.dp)
            .background(Color.Transparent)
            .navigationBarsPadding()
            .padding(bottom = 18.dp)
    ) {
        Canvas(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = barHorizontalMargin)
                .height(76.dp)
        ) {
            val top = 10.dp.toPx()
            val notchRadius = 40.dp.toPx()
            val centerX = size.width / 2f
            val path = Path().apply {
                moveTo(0f, top)
                lineTo(centerX - notchRadius, top)

                arcTo(
                    rect = Rect(
                        left = centerX - notchRadius,
                        top = top - notchRadius,
                        right = centerX + notchRadius,
                        bottom = top + notchRadius
                    ),
                    startAngleDegrees = 180f,
                    sweepAngleDegrees = 180f,
                    forceMoveTo = false
                )

                lineTo(size.width, top)
                lineTo(size.width, size.height)
                lineTo(0f, size.height)
                close()
            }

            drawPath(path = path, color = Color.White)
            drawPath(
                path = path,
                color = SangueDoceBorderColor,
                style = Stroke(width = 1.dp.toPx())
            )
        }

        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = barHorizontalMargin)
                .height(74.dp)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            CurvedBottomBarItem(
                selected = selectedItem == "home",
                label = "Início",
                icon = painterResource(id = R.drawable.begin),
                onClick = onHomeClick
            )

            CurvedBottomBarItem(
                selected = selectedItem == "measurements",
                label = "Medições",
                icon = painterResource(id = R.drawable.measurement),
                onClick = onMeasurementsClick
            )

            Spacer(modifier = Modifier.width(58.dp))

            CurvedBottomBarItem(
                selected = selectedItem == "content",
                label = "Refeições",
                icon = painterResource(id = R.drawable.food),
                onClick = onContentClick
            )

            CurvedBottomBarItem(
                selected = selectedItem == "profile",
                label = "Perfil",
                icon = painterResource(id = R.drawable.user),
                onClick = onProfileClick
            )
        }

        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = 92.dp)
                .size(70.dp)
                .clip(CircleShape)
                .background(Color.White)
                .clickable(
                    interactionSource = interactionSource,
                    indication = null,
                    role = Role.Button,
                    onClick = bloodClick
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                painter = painterResource(id = R.drawable.blood),
                contentDescription = "Registrar glicemia",
                tint = Color.Unspecified,
                modifier = Modifier.size(44.dp)
            )
        }
    }
}

@Composable
fun SangueDoceClassicBottomBar(
    selectedItem: String,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onContentClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 4.dp
    ) {
        NavigationBarItem(
            selected = selectedItem == "home",
            onClick = onHomeClick,
            icon = {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = "Início"
                )
            },
            label = {
                Text("Início")
            }
        )

        NavigationBarItem(
            selected = selectedItem == "measurements",
            onClick = onMeasurementsClick,
            icon = {
                Icon(
                    imageVector = Icons.Default.MonitorHeart,
                    contentDescription = "Medições"
                )
            },
            label = {
                Text("Medições")
            }
        )

        NavigationBarItem(
            selected = selectedItem == "content",
            onClick = onContentClick,
            icon = {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Article,
                    contentDescription = "Conteúdos"
                )
            },
            label = {
                Text("Conteúdos")
            }
        )

        NavigationBarItem(
            selected = selectedItem == "profile",
            onClick = onProfileClick,
            icon = {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Perfil"
                )
            },
            label = {
                Text("Perfil")
            }
        )
    }
}

@Preview(
    name = "Bottom bar curva",
    showBackground = true,
    backgroundColor = 0xFFF4F7FA,
    widthDp = 390,
    heightDp = 220
)
@Composable
private fun SangueDoceBottomBarPreview() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(220.dp)
            .background(SangueDoceBackground),
        contentAlignment = Alignment.BottomCenter
    ) {
        SangueDoceBottomBar(
            selectedItem = "home",
            onHomeClick = {},
            onMeasurementsClick = {},
            onContentClick = {},
            onProfileClick = {}
        )
    }
}

@Preview(
    name = "Bottom bar classica",
    showBackground = true,
    backgroundColor = 0xFFF4F7FA,
    widthDp = 390
)
@Composable
private fun SangueDoceClassicBottomBarPreview() {
    SangueDoceClassicBottomBar(
        selectedItem = "home",
        onHomeClick = {},
        onMeasurementsClick = {},
        onContentClick = {},
        onProfileClick = {}
    )
}

@Composable
private fun CurvedBottomBarItem(
    selected: Boolean,
    label: String,
    icon: Painter,
    onClick: () -> Unit
) {
    val contentColor = if (selected) SangueDocePrimary else SangueDoceMutedText

    Column(
        modifier = Modifier
            .width(74.dp)
            .clickable(
                role = Role.Tab,
                onClick = onClick
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            painter = icon,
            contentDescription = label,
            tint = Color.Unspecified,
            modifier = Modifier.size(30.dp)
        )

        Text(
            text = label,
            color = contentColor,
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
            maxLines = 1
        )
    }
}
