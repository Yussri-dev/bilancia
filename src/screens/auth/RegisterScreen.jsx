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
    ScrollView,
} from "react-native";
import { authApi } from "@api/authApi";
import { useAuth } from "@contexts/authContext";
import { useTranslation } from "react-i18next"; // ✅ Added

export default function RegisterScreen({ navigation }) {
    const { setUser } = useAuth();
    const { t } = useTranslation(); // ✅ Added

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isFormValid = () => {
        if (!fullName || !email || !password || !confirmPassword) return false;
        if (password.length < 6) return false;
        if (password !== confirmPassword) return false;
        return true;
    };

    const handleRegister = async () => {
        if (!isFormValid()) {
            Alert.alert(
                t("common.error"),
                t("register.invalidForm")
            );
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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inner}>
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

                    <TextInput
                        placeholder={t("register.password")}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder={t("register.confirmPassword")}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

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

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{t("register.button")}</Text>
                        )}
                    </TouchableOpacity>

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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: "#0B1221",
        paddingVertical: 20,
    },
    inner: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#7C3AED",
        textAlign: "center",
        marginBottom: 24,
    },
    input: {
        backgroundColor: "#1E293B",
        color: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#7C3AED",
        padding: 16,
        borderRadius: 10,
        marginTop: 12,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
    },
    errorText: {
        color: "#f87171",
        marginBottom: 8,
        textAlign: "center",
    },
    successText: {
        color: "#22c55e",
        marginBottom: 8,
        textAlign: "center",
    },
    linkText: {
        color: "#94A3B8",
        textAlign: "center",
    },
    linkHighlight: {
        color: "#7C3AED",
        fontWeight: "600",
    },
});
