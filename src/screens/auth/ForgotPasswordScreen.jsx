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
    Animated
} from "react-native";
import { authApi } from "@api/authApi";
import { useTranslation } from "react-i18next";
import { getStyles } from "@theme/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@contexts/ThemeContext";
import CustomAlert from "@components/CustomAlert";

export default function ForgotPasswordScreen({ navigation }) {
    const { colors, toggleTheme, mode } = useTheme();
    const { t, i18n } = useTranslation();
    const styles = getStyles(colors);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Alert states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertMessage, setAlertMessage] = useState("");

    // Use ref to prevent navigation during alert display
    const navigationTimeoutRef = useRef(null);
    const shouldNavigateRef = useRef(false);

    const scaleAnim = new Animated.Value(1);

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

    const handleForgotPassword = async () => {
        if (!email) {
            shouldNavigateRef.current = false;
            setAlertType("error");
            setAlertMessage(t("forgot.enterEmail"));
            setAlertVisible(true);
            return;
        }

        try {
            setLoading(true);
            setSuccessMessage("");
            await authApi.forgotPassword({ email: email.trim() });

            setSuccessMessage(t("forgot.successMessage"));
        } catch (err) {
            console.error("Forgot password error: ", err);
            setLoading(false);
            shouldNavigateRef.current = false;

            setAlertType("error");
            setAlertMessage(t("forgot.errorGeneral"));
            setAlertVisible(true);
        } finally {
            setLoading(false);
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
                    <Text style={styles.title}>{t("forgot.title")}</Text>
                    <Text style={styles.subtitle}>{t("forgot.subtitle")}</Text>

                    <TextInput
                        placeholder={t("forgot.emailPlaceholder")}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handleForgotPassword}
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
                                        {t("forgot.sendLink")}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {successMessage ? (
                        <Text style={styles.successText}>{successMessage}</Text>
                    ) : null}

                    <View style={styles.linkRow}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Register")}
                        >
                            <Text style={styles.linkHighlight}>
                                {t("login.createAccount")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.linkHighlight}>
                                {t("login.backToLogin")}
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