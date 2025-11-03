// src/screens/auth/LoginScreen.jsx
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
import { useAuth } from "../../contexts/authContext";

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        try {
            setLoading(true);
            await login(email.trim(), password);
            Alert.alert("Succès", "Connexion réussie !");
            navigation.replace("Dashboard");
        } catch (err) {
            console.error("Login error:", err);
            Alert.alert("Erreur", err.message || "Email ou mot de passe invalide.");
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
                <Text style={styles.title}>Bilancia</Text>

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                />

                <View style={{ position: "relative" }}>
                    <TextInput
                        placeholder="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#94A3B8"
                        style={[styles.input, { paddingRight: 40 }]}
                    />

                    <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                    >
                        <Text style={{ color: "#94A3B8" }}>
                            {showPassword ? "🙈" : "👁️"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>

                {/* Liens register + forgot password */}
                <View style={styles.linkRow}>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.linkHighlight}>Créer un compte</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                        <Text style={styles.linkSecondary}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                </View>
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
        fontSize: 28,
        fontWeight: "bold",
        color: "#7C3AED",
        textAlign: "center",
        marginBottom: 36,
    },
    input: {
        backgroundColor: "#1E293B",
        color: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 16,
    },
    eyeButton: {
        position: "absolute",
        right: 10,
        top: 14,
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
    linkRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    linkHighlight: {
        color: "#7C3AED",
        fontWeight: "600",
    },
    linkSecondary: {
        color: "#94A3B8",
    },
});
