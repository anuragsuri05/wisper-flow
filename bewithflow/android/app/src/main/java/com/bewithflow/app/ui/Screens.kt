package com.bewithflow.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bolt
import androidx.compose.material.icons.outlined.Brush
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bewithflow.app.auth.ChatGPTAuth
import com.bewithflow.app.core.Prompt
import com.bewithflow.app.core.Styles
import com.bewithflow.app.net.ChatGPT
import kotlinx.coroutines.launch
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

@Composable
fun App(ui: UiState) {
    @Suppress("UNUSED_VARIABLE") val v = ui.version // recompose on refresh
    Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        when {
            ui.user == null -> AuthScreen(ui)
            !ui.onboarded -> SetupScreen(ui)
            else -> MainScreen(ui)
        }
    }
}

// ---------- shared bits ----------

@Composable
private fun Muted(text: String, modifier: Modifier = Modifier, size: Int = 14) =
    Text(text, modifier, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = size.sp, lineHeight = (size * 1.45).sp)

@Composable
private fun Chip(text: String, color: Color = MaterialTheme.colorScheme.onSurfaceVariant) {
    Box(Modifier.background(color.copy(alpha = 0.12f), RoundedCornerShape(50)).padding(horizontal = 10.dp, vertical = 3.dp)) {
        Text(text, color = color, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun Section(title: String? = null, content: @Composable () -> Unit) {
    Card(
        Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            if (title != null) Text(title, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            content()
        }
    }
}

@Composable
private fun Primary(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) =
    Button(onClick, modifier.height(50.dp), enabled = enabled, shape = RoundedCornerShape(14.dp)) { Text(text, fontWeight = FontWeight.SemiBold) }

@Composable
private fun Secondary(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) =
    OutlinedButton(onClick, modifier.height(50.dp), shape = RoundedCornerShape(14.dp)) { Text(text, color = MaterialTheme.colorScheme.onSurface) }

// ---------- sign in ----------

@Composable
private fun AuthScreen(ui: UiState) {
    val scope = rememberCoroutineScope()
    fun signIn(accountId: String?) {
        ui.signInError = null
        ui.planUnavailable = false
        ui.signingIn = true
        ui.signInStatus = "Finish signing in in your browser"
        scope.launch {
            try {
                ui.engine.signIn(accountId, ui.actions::openBrowser) { ui.signInStatus = it }
            } catch (e: ChatGPTAuth.AuthException) {
                if (e.code == "plan_unavailable") ui.planUnavailable = true
                if (e.message != "Sign-in cancelled.") ui.signInError = e.message
            } catch (e: Exception) {
                ui.signInError = e.message
            } finally {
                ui.signingIn = false
                ui.refresh()
            }
        }
    }
    Column(
        Modifier.fillMaxSize().safeDrawingPadding().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Spacer(Modifier.height(24.dp))
        Text("bewithflow", fontWeight = FontWeight.SemiBold, fontSize = 17.sp)
        Spacer(Modifier.height(28.dp))
        Text("Don’t type,", style = Display.copy(fontSize = 46.sp, lineHeight = 48.sp))
        Text("just speak.", style = Display.copy(fontSize = 46.sp, lineHeight = 48.sp), color = MaterialTheme.colorScheme.secondary)
        Muted("Use the bewithflow keyboard in any app. Hold the mic, say what you mean, and let go: it drops the ums, follows your corrections and types the sentence you meant.", size = 15)
        Spacer(Modifier.height(8.dp))

        if (ui.signingIn) {
            Section {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                    Text(ui.signInStatus, fontWeight = FontWeight.Medium)
                }
                Muted("A ChatGPT page opened. Approve bewithflow there, then come back.")
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton({ ui.engine.auth.reopen(ui.actions::openBrowser) }) { Text("Open the page again") }
                    TextButton({ ui.engine.auth.cancel() }) { Text("Cancel") }
                }
            }
        } else {
            ui.saved.forEach { a ->
                Secondary(if (a.local) "Continue on this phone (Free)" else "Continue as ${a.name.ifBlank { a.email }}", { if (a.local) ui.engine.useFree(a.name) else signIn(a.id) }, Modifier.fillMaxWidth())
            }
            Primary(if (ui.saved.isEmpty()) "Continue with ChatGPT" else "Sign in with another ChatGPT account", { signIn(null) }, Modifier.fillMaxWidth())
            if (ui.saved.none { it.local }) {
                Muted("On ChatGPT Free?", Modifier.align(Alignment.CenterHorizontally), 13)
                Secondary("Use bewithflow free on this phone", { ui.engine.useFree(ui.actions.deviceName()) }, Modifier.fillMaxWidth())
            }
        }
        ui.signInError?.let { Text(it, color = MaterialTheme.colorScheme.error, fontSize = 14.sp) }
        if (ui.planUnavailable) Primary("Use bewithflow free on this phone", { ui.engine.useFree(ui.actions.deviceName()) }, Modifier.fillMaxWidth())
        Muted("OpenAI only lets ChatGPT Plus and Pro accounts sign in to apps like bewithflow. On Free, everything runs on this phone, and you can connect ChatGPT later.", size = 12)
    }
}

// ---------- setup ----------

@Composable
private fun SetupScreen(ui: UiState) {
    var step by rememberSaveable { mutableStateOf(0) }
    var tryText by rememberSaveable { mutableStateOf("") }
    val steps = 4
    Column(Modifier.fillMaxSize().safeDrawingPadding().verticalScroll(rememberScrollState()).padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(steps) { i ->
                Box(Modifier.weight(1f).height(4.dp).background(if (i < step) MaterialTheme.colorScheme.primary else if (i == step) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp)))
            }
        }
        Spacer(Modifier.height(8.dp))
        when (step) {
            0 -> {
                Text(if (ui.user?.local == true) "Welcome to bewithflow" else "Hi ${ui.user?.name?.substringBefore(" ")}, you’re in", style = Display)
                AccountCard(ui)
                Primary("Continue", { step++ }, Modifier.fillMaxWidth())
            }
            1 -> {
                Text("Let bewithflow hear you", style = Display)
                Muted("The microphone is used only while you hold the mic on the bewithflow keyboard.", size = 15)
                Section {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) { Text("Microphone", fontWeight = FontWeight.Medium) }
                        if (ui.hasMic) Chip("Allowed", Brand.green) else Button(ui.actions::requestMic) { Text("Allow") }
                    }
                }
                Primary("Continue", { step++ }, Modifier.fillMaxWidth(), enabled = ui.hasMic)
            }
            2 -> {
                Text("Turn on the bewithflow keyboard", style = Display)
                Muted("It types your dictation into WhatsApp, Gmail, Slack and every other app.", size = 15)
                Section {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("1. Enable it", fontWeight = FontWeight.Medium)
                            Muted("Switch on “bewithflow Keyboard”", size = 13)
                        }
                        if (ui.keyboardEnabled) Chip("On", Brand.green) else Button(ui.actions::openKeyboardSettings) { Text("Open") }
                    }
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("2. Choose it", fontWeight = FontWeight.Medium)
                            Muted("Or switch to it any time with the 🌐 / keyboard button", size = 13)
                        }
                        if (ui.keyboardSelected) Chip("Selected", Brand.green) else Button(ui.actions::showKeyboardPicker, enabled = ui.keyboardEnabled) { Text("Choose") }
                    }
                }
                Primary("Continue", { step++ }, Modifier.fillMaxWidth(), enabled = ui.keyboardEnabled)
            }
            else -> {
                Text("Say something messy", style = Display)
                Muted("Tap the box, then hold the mic on the bewithflow keyboard and say: “um so can we meet at three, no wait, four tomorrow”. Let go to type.", size = 15)
                OutlinedTextField(tryText, { tryText = it }, Modifier.fillMaxWidth().height(140.dp), placeholder = { Text("Your words will appear here") })
                Primary("Start using bewithflow", {
                    ui.engine.store.setOnboarded(true)
                    ui.refresh()
                }, Modifier.fillMaxWidth())
            }
        }
        if (step > 0) TextButton({ step-- }) { Text("Back") }
    }
}

@Composable
private fun AccountCard(ui: UiState) {
    val user = ui.user ?: return
    Section {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(if (user.local) "Free mode" else user.email, Modifier.weight(1f), fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
            when {
                user.local -> Chip("No ChatGPT sign-in", Brand.amber)
                user.planUsage -> Chip("ChatGPT plan connected", Brand.green)
                else -> Chip("Plan usage off", Brand.amber)
            }
        }
        Muted(
            when {
                user.local -> "Everything runs on this phone with basic cleanup. Connect ChatGPT Plus or Pro for AI cleanup."
                user.planUsage -> "Every dictation is cleaned up by your ChatGPT plan."
                else -> "bewithflow can’t use this ChatGPT plan, so dictations get basic cleanup."
            },
        )
        if (user.planUsage) TextButton({ ui.actions.open(ChatGPT.USAGE_URL) }, contentPadding = PaddingValues(0.dp)) { Text("Manage usage limits", color = MaterialTheme.colorScheme.secondary) }
    }
}

// ---------- main ----------

private enum class Tab(val label: String) { HOME("Home"), DICTIONARY("Dictionary"), SNIPPETS("Snippets"), STYLE("Style"), SETTINGS("Settings") }

@Composable
private fun MainScreen(ui: UiState) {
    var tab by rememberSaveable { mutableStateOf(Tab.HOME) }
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                Tab.entries.forEach { t ->
                    val icon = when (t) {
                        Tab.HOME -> Icons.Outlined.Home
                        Tab.DICTIONARY -> Icons.Outlined.MenuBook
                        Tab.SNIPPETS -> Icons.Outlined.Bolt
                        Tab.STYLE -> Icons.Outlined.Brush
                        Tab.SETTINGS -> Icons.Outlined.Settings
                    }
                    NavigationBarItem(t == tab, { tab = t }, { Icon(icon, null) }, label = { Text(t.label, fontSize = 11.sp) })
                }
            }
        },
    ) { pad ->
        Box(Modifier.padding(pad).consumeWindowInsets(pad)) {
            when (tab) {
                Tab.HOME -> HomeScreen(ui)
                Tab.DICTIONARY -> DictionaryScreen(ui)
                Tab.SNIPPETS -> SnippetsScreen(ui)
                Tab.STYLE -> StyleScreen(ui)
                Tab.SETTINGS -> SettingsScreen(ui)
            }
        }
    }
}

@Composable
private fun PageTitle(title: String, sub: String? = null) {
    Column(Modifier.padding(top = 20.dp, bottom = 4.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(title, style = Display)
        sub?.let { Muted(it) }
    }
}

private val PROVIDER = mapOf("chatgpt" to ("ChatGPT" to Brand.violet), "local" to ("Basic cleanup" to Brand.amber))

private fun dayLabel(at: Long): String {
    val d = Calendar.getInstance().apply { timeInMillis = at }
    val today = Calendar.getInstance()
    val y = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
    fun same(a: Calendar, b: Calendar) = a.get(Calendar.YEAR) == b.get(Calendar.YEAR) && a.get(Calendar.DAY_OF_YEAR) == b.get(Calendar.DAY_OF_YEAR)
    return when {
        same(d, today) -> "TODAY"
        same(d, y) -> "YESTERDAY"
        else -> DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(at)).uppercase()
    }
}

@Composable
private fun HomeScreen(ui: UiState) {
    val user = ui.user ?: return
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    // Free mode has no real name (only the phone's), so greet without one
    val name = if (user.local) "" else user.name.substringBefore(" ").takeIf { it.isNotBlank() }?.let { ", $it" }.orEmpty()
    LazyColumn(Modifier.fillMaxSize().safeDrawingPadding(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            PageTitle(if (hour < 12) "Good morning$name" else if (hour < 18) "Welcome back$name" else "Good evening$name")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 8.dp)) {
                Chip("🔥 ${ui.stats.streak} day streak")
                Chip("${ui.stats.totalWords} words")
                Chip("${ui.stats.dictations} dictations")
            }
        }
        if (!ui.keyboardEnabled || !ui.keyboardSelected || !ui.hasMic) item {
            Section {
                Text("Finish setting up the keyboard", fontWeight = FontWeight.SemiBold)
                Muted(if (!ui.hasMic) "bewithflow needs the microphone." else if (!ui.keyboardEnabled) "The bewithflow keyboard is turned off." else "Switch to the bewithflow keyboard to dictate.")
                Button({
                    when {
                        !ui.hasMic -> ui.actions.requestMic()
                        !ui.keyboardEnabled -> ui.actions.openKeyboardSettings()
                        else -> ui.actions.showKeyboardPicker()
                    }
                }) { Text("Fix it") }
            }
        }
        item {
            Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF161514))) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Hold the mic to dictate in any app", style = Display.copy(fontSize = 26.sp, lineHeight = 30.sp), color = Color(0xFFF4F2EE))
                    Text("Works in WhatsApp, Gmail, Slack and every app with a text box. Tap the mic once for hands-free.", color = Color(0xFFB9B4AB), fontSize = 14.sp)
                }
            }
        }
        if (ui.history.isEmpty()) item {
            Section {
                Text("Your words will show up here", style = Display.copy(fontSize = 22.sp))
                Muted("Open any app, switch to the bewithflow keyboard and hold the mic.")
            }
        }
        var lastDay = ""
        ui.history.forEach { h ->
            val day = dayLabel(h.at)
            if (day != lastDay) {
                lastDay = day
                item(key = "day-$day-${h.id}") { Muted(day, Modifier.padding(top = 10.dp), 12) }
            }
            item(key = h.id) {
                Section {
                    Text(h.text)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Muted(DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(h.at)), size = 12)
                        if (h.app.isNotBlank()) Muted("· ${h.app}", size = 12)
                        PROVIDER[h.provider]?.let { (label, color) -> Chip(label, color) }
                        if (h.latencyMs > 0) Muted("${"%.1f".format(h.latencyMs / 1000.0)} s", size = 12)
                        Spacer(Modifier.weight(1f))
                        TextButton({ ui.actions.copy(h.text) }) { Text("Copy") }
                    }
                }
            }
        }
    }
}

@Composable
private fun DictionaryScreen(ui: UiState) {
    var word by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    LazyColumn(Modifier.fillMaxSize().safeDrawingPadding(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { PageTitle("Dictionary", "Names, product terms and acronyms bewithflow should always spell your way.") }
        item {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(word, { word = it; error = null }, Modifier.weight(1f), placeholder = { Text("e.g. Laksh, Supabase") }, singleLine = true)
                Button({
                    runCatching { ui.engine.store.addWord(word) }.onSuccess { word = ""; ui.refresh() }.onFailure { error = it.message }
                }) { Text("Add") }
            }
            error?.let { Text(it, color = MaterialTheme.colorScheme.error, fontSize = 13.sp) }
        }
        items(ui.dictionary, key = { it }) { w ->
            Section {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(w, Modifier.weight(1f), fontWeight = FontWeight.Medium)
                    TextButton({ ui.engine.store.removeWord(w); ui.refresh() }) { Text("Remove", color = MaterialTheme.colorScheme.error) }
                }
            }
        }
    }
}

@Composable
private fun SnippetsScreen(ui: UiState) {
    var editing by remember { mutableStateOf<com.bewithflow.app.core.Snippets.Snippet?>(null) }
    var adding by remember { mutableStateOf(false) }
    LazyColumn(Modifier.fillMaxSize().safeDrawingPadding(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            PageTitle("Snippets", "Say a short phrase, get the full text. Great for links, addresses and sign-offs.")
            Primary("Add snippet", { adding = true }, Modifier.padding(top = 8.dp))
        }
        items(ui.snippets, key = { it.id }) { s ->
            Section {
                Text("${s.trigger} →", fontWeight = FontWeight.SemiBold)
                Muted(s.expansion)
                Row {
                    TextButton({ editing = s }) { Text("Edit") }
                    TextButton({ ui.engine.store.removeSnippet(s.id); ui.refresh() }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
                }
            }
        }
    }
    if (adding || editing != null) {
        var trigger by remember(editing) { mutableStateOf(editing?.trigger ?: "") }
        var expansion by remember(editing) { mutableStateOf(editing?.expansion ?: "") }
        var error by remember { mutableStateOf<String?>(null) }
        AlertDialog(
            onDismissRequest = { adding = false; editing = null },
            title = { Text(if (editing != null) "Edit snippet" else "Add snippet") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(trigger, { trigger = it }, label = { Text("Snippet") }, placeholder = { Text("my calendly link") }, singleLine = true)
                    OutlinedTextField(expansion, { expansion = it }, label = { Text("Expansion") }, minLines = 3)
                    error?.let { Text(it, color = MaterialTheme.colorScheme.error, fontSize = 13.sp) }
                }
            },
            confirmButton = {
                TextButton({
                    runCatching { ui.engine.store.saveSnippet(editing?.id, trigger, expansion) }
                        .onSuccess { adding = false; editing = null; ui.refresh() }
                        .onFailure { error = it.message }
                }) { Text("Save") }
            },
            dismissButton = { TextButton({ adding = false; editing = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun StyleScreen(ui: UiState) {
    var tab by rememberSaveable { mutableStateOf("personal") }
    val cats = Styles.CATEGORIES.values.toList()
    val cat = Styles.CATEGORIES.getValue(tab)
    LazyColumn(Modifier.fillMaxSize().safeDrawingPadding(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { PageTitle("Style", "bewithflow writes differently depending on the app you’re in.") }
        item {
            TabRow(cats.indexOf(cat), containerColor = MaterialTheme.colorScheme.background) {
                cats.forEach { c -> Tab(c.id == tab, { tab = c.id }, text = { Text(c.label.substringBefore(" "), fontSize = 13.sp) }) }
            }
            Muted("Used in ${cat.apps}.", Modifier.padding(top = 8.dp), 13)
        }
        items(cat.styles, key = { "$tab-$it" }) { id ->
            val style = Styles.STYLES.getValue(id)
            val chosen = ui.settings.styles[tab] == id
            Card(
                Modifier.fillMaxWidth().clickable { ui.engine.store.updateSettings { s -> s.copy(styles = s.styles + (tab to id)) }; ui.refresh() },
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(if (chosen) 2.dp else 1.dp, if (chosen) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.outline),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(style.label, style = Display.copy(fontSize = 24.sp))
                    Muted(style.desc, size = 13)
                    Box(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(12.dp)).padding(12.dp)) {
                        Text(Styles.applyLocally(cat.sample, id), fontSize = 14.sp)
                    }
                }
            }
        }
        item {
            Section("How much to clean up") {
                val levels = listOf("light" to "Light", "standard" to "Standard", "polished" to "Polished")
                SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                    levels.forEachIndexed { i, (id, label) ->
                        SegmentedButton(ui.settings.cleanupLevel == id, { ui.engine.store.updateSettings { it.copy(cleanupLevel = id) }; ui.refresh() }, SegmentedButtonDefaults.itemShape(i, levels.size)) { Text(label) }
                    }
                }
            }
        }
    }
}

private val LANGUAGES = listOf("" to "Phone’s language", "en-US" to "English (US)", "en-GB" to "English (UK)", "en-IN" to "English (India)", "hi-IN" to "Hindi", "es-ES" to "Spanish", "fr-FR" to "French", "de-DE" to "German", "pt-BR" to "Portuguese", "ja-JP" to "Japanese")

@Composable
private fun SettingsScreen(ui: UiState) {
    val scope = rememberCoroutineScope()
    val user = ui.user ?: return
    var prompt by remember(ui.settings.customPrompt) { mutableStateOf(ui.settings.customPrompt.ifBlank { Prompt.build(ui.settings.cleanupLevel, dictionary = ui.dictionary) }) }
    var modelMenu by remember { mutableStateOf(false) }
    var langMenu by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(user.id) {
        if (user.planUsage) ui.models = runCatching { ui.engine.models() }.getOrElse { message = it.message; emptyList() }
    }
    Column(Modifier.fillMaxSize().safeDrawingPadding().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        PageTitle("Settings")
        AccountCard(ui)
        if (user.planUsage) Section("ChatGPT model") {
            Muted("Faster models type sooner.", size = 13)
            Box {
                OutlinedButton({ modelMenu = true }) { Text(ui.models?.firstOrNull { it.slug == ui.settings.chatgptModel }?.name ?: ui.settings.chatgptModel.ifBlank { "Loading…" }) }
                DropdownMenu(modelMenu, { modelMenu = false }) {
                    ui.models.orEmpty().forEach { m ->
                        DropdownMenuItem({ Text(m.name) }, { ui.engine.store.updateSettings { it.copy(chatgptModel = m.slug) }; modelMenu = false; ui.refresh() })
                    }
                }
            }
        }
        Section("Language you speak") {
            Box {
                OutlinedButton({ langMenu = true }) { Text(LANGUAGES.firstOrNull { it.first == ui.settings.language }?.second ?: ui.settings.language) }
                DropdownMenu(langMenu, { langMenu = false }) {
                    LANGUAGES.forEach { (id, label) -> DropdownMenuItem({ Text(label) }, { ui.engine.store.updateSettings { it.copy(language = id) }; langMenu = false; ui.refresh() }) }
                }
            }
        }
        Section {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Key vibration", fontWeight = FontWeight.Medium)
                    Muted("A light tap when you press keys", size = 13)
                }
                Switch(ui.settings.haptics, { v -> ui.engine.store.updateSettings { it.copy(haptics = v) }; ui.refresh() })
            }
        }
        Section("Master prompt") {
            Muted("The rules your AI follows for every dictation. Your style, dictionary and snippets are added automatically.", size = 13)
            OutlinedTextField(prompt, { prompt = it }, Modifier.fillMaxWidth().height(220.dp), textStyle = MaterialTheme.typography.bodySmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button({
                    val def = Prompt.build(ui.settings.cleanupLevel, dictionary = ui.dictionary)
                    ui.engine.store.updateSettings { it.copy(customPrompt = if (prompt.trim() == def.trim()) "" else prompt.trim()) }
                    message = "Prompt saved"
                    ui.refresh()
                }) { Text("Save") }
                OutlinedButton({
                    ui.engine.store.updateSettings { it.copy(customPrompt = "") }
                    prompt = Prompt.build(ui.settings.cleanupLevel, dictionary = ui.dictionary)
                    message = "Prompt reset"
                    ui.refresh()
                }) { Text("Reset") }
            }
        }
        Section("Account") {
            if (user.local) Primary("Connect ChatGPT Plus or Pro", {
                ui.signingIn = true
                scope.launch {
                    runCatching { ui.engine.signIn(null, ui.actions::openBrowser) { } }.onFailure { message = it.message }
                    ui.signingIn = false
                    ui.refresh()
                }
            }, Modifier.fillMaxWidth())
            Secondary("Sign out", {
                scope.launch {
                    val revoked = ui.engine.signOut()
                    if (!revoked) message = "Signed out here. Disconnect bewithflow in ChatGPT Settings to be sure."
                    ui.refresh()
                }
            }, Modifier.fillMaxWidth())
            TextButton({ scope.launch { ui.engine.forget(); ui.refresh() } }) { Text("Remove from this phone", color = MaterialTheme.colorScheme.error) }
        }
        message?.let { Muted(it) }
        val context = androidx.compose.ui.platform.LocalContext.current
        val version = remember { runCatching { context.packageManager.getPackageInfo(context.packageName, 0).versionName }.getOrNull().orEmpty() }
        Muted("bewithflow $version", size = 11)
    }
}
