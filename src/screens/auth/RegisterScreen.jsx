import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated
} from "react-native";
import { authApi } from "@api/authApi";
import { useAuth } from "@contexts/authContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { LinearGradient } from "expo-linear-gradient";
import CustomAlert from "@components/CustomAlert";

export default function RegisterScreen({ navigation }) {
    const scaleAnim = new Animated.Value(1);

    const { setUser } = useAuth();
    const { t, i18n } = useTranslation();
    const { colors, toggleTheme, mode } = useTheme();
    const styles = getStyles(colors);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // Alert states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertMessage, setAlertMessage] = useState("");

    // Use ref to prevent navigation during alert display
    const navigationTimeoutRef = useRef(null);
    const shouldNavigateRef = useRef(false);

    const passwordIssue = (p) => {
        if (p.length < 8) return t("register.short");
        if (!/[a-z]/.test(p)) return t("register.lower");
        if (!/[A-Z]/.test(p)) return t("register.upper");
        if (!/\d/.test(p)) return t("register.diggit");
        if (!/[#@!$%^&*?]/.test(p)) return t("register.special");;
        return null;
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

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            shouldNavigateRef.current = false;
            setAlertType("error");
            setAlertMessage(t("login.fillAllFields"));
            setAlertVisible(true);
            return;
        }

        const issue = passwordIssue(password);
        if (issue) {
            shouldNavigateRef.current = false;
            setAlertType("error");
            setAlertMessage(t(`${issue}`));
            setAlertVisible(true);
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(t("common.error"), t("register.passwordsMismatch"));
            return;
        }

        try {
            setLoading(true);
            const res = await authApi.register({
                fullName,
                email: email.trim(),
                password,
            });

            const token = res.token?.startsWith("Bearer ")
                ? res.token.substring("Bearer ".length)
                : res.token;

            if (token) {
                await setUser(token);
                Alert.alert(t("common.success"), t("register.success"));
                navigation.replace("Main");
            } else {
                Alert.alert(t("common.info"), t("register.missingToken"));
            }
        } catch (err) {
            console.error("Register error:", err);
            Alert.alert(t("common.error"), err.message || t("register.failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleAlertClose = () => {
        setAlertVisible(false);

        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }

        if (shouldNavigateRef.current) {
            navigationTimeoutRef.current = setTimeout(() => {
                shouldNavigateRef.current = false;
                confirmLogin();
            }, 300);
        }
    };
    return (
        <LinearGradient
            colors={
                mode === "light" ? ["#F9FAFB", "#E5E7EB"] : ["#0F172A", "#1E1B4B"]
            }
            style={styles.gradient}
        >

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >


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

                <View style={styles.cardLogin}>
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

                    <Text style={styles.title}>{t("register.title")}</Text>

                    <TextInput
                        placeholder={t("register.fullName")}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder={t("register.email")}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <View style={{ position: "relative" }}>
                        <TextInput
                            placeholder={t("register.password")}
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

                    <View style={{ position: "relative" }}>
                        <TextInput
                            placeholder={t("register.password")}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            placeholderTextColor="#A1A1AA"
                            style={[styles.input, { paddingRight: 40 }]}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword((prev) => !prev)}
                            style={styles.eyeButton}
                        >
                            <Text style={{ color: "#A1A1AA" }}>
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: "center", marginBottom: "10", height: "20" }}>
                        {password && confirmPassword ? (
                            password === confirmPassword ? (
                                <Text style={styles.successText}>
                                    ✅ {t("register.passwordsMatch")}
                                </Text>
                            ) : (
                                <Text style={styles.errorText}>
                                    ❌ {t("register.passwordsMismatch")}
                                </Text>
                            )
                        ) : null}
                    </View>

                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handleRegister}
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


                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                        style={{ marginTop: 16 }}
                    >
                        <Text style={styles.linkText}>
                            {t("register.haveAccount")}{" "}
                            <Text style={styles.linkHighlight}>{t("register.loginLink")}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

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