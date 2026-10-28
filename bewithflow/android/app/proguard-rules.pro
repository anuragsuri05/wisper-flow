# OkHttp / Okio ship their own consumer rules. Keep the IME and services referenced from the manifest.
-keep class com.bewithflow.app.ime.FlowKeyboardService { *; }
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
