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
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const scaleAnim = new Animated.Value(1);
    const { colors, toggleTheme, mode } = useTheme();

    const styles = getStyles(colors);
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        try {
            setLoading(true);
            await login(email.trim(), password);
            Alert.alert("Succès", "Connexion réussie !");
            navigation.replace("Home");
        } catch (err) {
            console.error("Login error:", err);
            Alert.alert("Erreur", err.message || "Email ou mot de passe invalide.");
        } finally {
            setLoading(false);
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

    return (
        <LinearGradient
            colors={
                mode === "light"
                    ? ["#F9FAFB", "#E5E7EB"] 
                    : ["#0F172A", "#1E1B4B"]
            }
            style={styles.gradient}
        >

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
            >
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={{ alignSelf: "flex-end", marginBottom: 12 }}
                >
                    <Text style={{ color: colors.primary }}>
                        {mode === "light" ? "🌙 Mode sombre" : "☀️ Mode clair"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.cardLogin}>
                    <Text style={styles.title}>Bilancia</Text>
                    <Text style={styles.subtitle}>Gérez vos finances avec clarté ✨</Text>

                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#A1A1AA"
                        style={styles.input}
                    />

                    <View style={{ position: "relative" }}>
                        <TextInput
                            placeholder="Mot de passe"
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
                                    <Text style={styles.buttonText}>Se connecter</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

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
        </LinearGradient>
    );
}