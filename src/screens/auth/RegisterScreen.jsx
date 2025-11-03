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
import { authApi } from "../../api/authApi"; // futur alias : @apis/authApi
import { useAuth } from "../../contexts/authContext";

export default function RegisterScreen({ navigation }) {
    const { setUser } = useAuth();

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
                "Erreur",
                "Veuillez vérifier les champs (mots de passe identiques et ≥ 6 caractères)."
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
                Alert.alert("Succès", "Compte créé avec succès !");
                navigation.replace("Home");
            } else {
                Alert.alert("Info", "Inscription réussie mais token manquant.");
            }
        } catch (err) {
            console.error("Register error:", err);
            Alert.alert("Erreur", err.message || "Échec de l’inscription.");
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
                    <Text style={styles.title}>Créer un compte</Text>

                    <TextInput
                        placeholder="Nom complet"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                    />

                    {password && confirmPassword ? (
                        password === confirmPassword ? (
                            <Text style={styles.successText}>
                                ✅ Les mots de passe correspondent.
                            </Text>
                        ) : (
                            <Text style={styles.errorText}>
                                ❌ Les mots de passe ne correspondent pas.
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
                            <Text style={styles.buttonText}>S’inscrire</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                        style={{ marginTop: 16 }}
                    >
                        <Text style={styles.linkText}>
                            Vous avez déjà un compte ?{" "}
                            <Text style={styles.linkHighlight}>Se connecter</Text>
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
