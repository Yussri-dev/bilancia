import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from "react-native";
import { useAuth } from "../../contexts/authContext";

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await login(email, password);
            Alert.alert("Succès", "Connexion réussie !");
        } catch (err) {
            console.error("Login error:", err);
            Alert.alert("Erreur", "Email ou mot de passe invalide.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bilancia</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Se connecter</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1221",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#7C3AED",
        textAlign: "center",
        marginBottom: 32,
    },
    input: {
        backgroundColor: "#1E293B",
        color: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#7C3AED",
        padding: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
});
