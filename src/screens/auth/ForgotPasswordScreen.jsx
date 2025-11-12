import React, { useState } from "react";
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
} from "react-native";
import { authApi } from "@api/authApi";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen({ navigation }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert(t("forgot.errorTitle"), t("forgot.enterEmail"));
            return;
        }

        try {
            setLoading(true);
            setSuccessMessage("");
            await authApi.forgotPassword({ email: email.trim() });

            setSuccessMessage(t("forgot.successMessage"));
        } catch (err) {
            console.error("Forgot password error:", err);
            Alert.alert(
                t("forgot.errorTitle"),
                err.message || t("forgot.errorGeneral")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.inner}>
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

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleForgotPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{t("forgot.sendLink")}</Text>
                    )}
                </TouchableOpacity>

                {successMessage ? (
                    <Text style={styles.successText}>{successMessage}</Text>
                ) : null}

                <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    style={{ marginTop: 24 }}
                >
                    <Text style={styles.linkText}>{t("forgot.backToLogin")}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1221",
        justifyContent: "center",
    },
    inner: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#7C3AED",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        color: "#94A3B8",
        textAlign: "center",
        marginBottom: 24,
        fontSize: 15,
    },
    input: {
        backgroundColor: "#1E293B",
        color: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#7C3AED",
        padding: 16,
        borderRadius: 10,
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
    },
    successText: {
        color: "#22c55e",
        textAlign: "center",
        marginTop: 16,
    },
    linkText: {
        color: "#94A3B8",
        textAlign: "center",
    },
});
