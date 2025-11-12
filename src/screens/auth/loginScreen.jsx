import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import CustomAlert from "../../components/CustomAlert";

export default function LoginScreen({ navigation }) {
    const { login, confirmLogin } = useAuth();
    const { colors, toggleTheme, mode } = useTheme();
    const { t, i18n } = useTranslation();
    const styles = getStyles(colors);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 🔔 Alert states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertMessage, setAlertMessage] = useState("");

    // Use ref to prevent navigation during alert display
    const navigationTimeoutRef = useRef(null);
    const shouldNavigateRef = useRef(false);

    const scaleAnim = new Animated.Value(1);

    const handleLogin = async () => {
        if (!email || !password) {
            shouldNavigateRef.current = false;
            setAlertType("error");
            setAlertMessage(t("login.fillAllFields"));
            setAlertVisible(true);
            return;
        }

        try {
            setLoading(true);
            await login(email.trim(), password);
            setLoading(false);

            // Mark that we should navigate after alert
            shouldNavigateRef.current = true;

            // Show success alert
            setAlertType("success");
            setAlertMessage(t("login.success"));
            setAlertVisible(true);

        } catch (err) {
            console.error("Login error:", err);
            setLoading(false);
            shouldNavigateRef.current = false;

            setAlertType("error");
            setAlertMessage(t("login.invalid"));
            setAlertVisible(true);
        }
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleAlertClose = () => {
        setAlertVisible(false);

        // Clear any pending navigation timeout
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }

        // Confirm login after alert closes if login was successful
        if (shouldNavigateRef.current) {
            // This will trigger automatic navigation via conditional rendering
            navigationTimeoutRef.current = setTimeout(() => {
                shouldNavigateRef.current = false;
                confirmLogin(); // Sets token, AppNavigator handles navigation automatically
            }, 300);
        }
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, []);

    return (
        <LinearGradient
            colors={
                mode === "light" ? ["#F9FAFB", "#E5E7EB"] : ["#0F172A", "#1E1B4B"]
            }
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
            >
                {/* Theme toggle */}
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={{ alignSelf: "flex-end", marginBottom: 12 }}
                >
                    <Text style={{ color: colors.primary }}>
                        {mode === "light"
                            ? "🌙 " + t("theme.dark")
                            : "☀️ " + t("theme.light")}
                    </Text>
                </TouchableOpacity>

                {/* Language Switcher */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginBottom: 16,
                        gap: 10,
                    }}
                >
                    <TouchableOpacity onPress={() => i18n.changeLanguage("fr")}>
                        <Text style={{ fontSize: 18 }}>🇫🇷</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => i18n.changeLanguage("en")}>
                        <Text style={{ fontSize: 18 }}>🇬🇧</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => i18n.changeLanguage("nl")}>
                        <Text style={{ fontSize: 18 }}>🇳🇱</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Card */}
                <View style={styles.cardLogin}>
                    <Text style={styles.title}>Bilancia</Text>
                    <Text style={styles.subtitle}>{t("login.subtitle")}</Text>

                    <TextInput
                        placeholder={t("login.email")}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#A1A1AA"
                        style={styles.input}
                    />

                    <View style={{ position: "relative" }}>
                        <TextInput
                            placeholder={t("login.password")}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            placeholderTextColor="#A1A1AA"
                            style={[styles.input, { paddingRight: 40 }]}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword((prev) => !prev)}
                            style={styles.eyeButton}
                        >
                            <Text style={{ color: "#A1A1AA" }}>
                                {showPassword ? "🙈" : "👁️"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handleLogin}
                            style={[styles.button, loading && { opacity: 0.7 }]}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#8B5CF6", "#7C3AED"]}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {t("login.button")}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.linkRow}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Register")}
                        >
                            <Text style={styles.linkHighlight}>
                                {t("login.createAccount")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("ForgotPassword")}
                        >
                            <Text style={styles.linkSecondary}>
                                {t("login.forgotPassword")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Custom styled alert - Always rendered */}
                {alertVisible && (
                    <CustomAlert
                        visible={alertVisible}
                        type={alertType}
                        title={t(`common.${alertType}`)}
                        message={alertMessage}
                        onClose={handleAlertClose}
                    />
                )}
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}