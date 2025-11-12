import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";

export default function CustomAlert({
    visible,
    type = "success",
    title,
    message,
    onClose,
}) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Use useRef to persist animation values
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Trigger animation when visible changes
    useEffect(() => {
        if (visible) {
            // Reset and animate in
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);

            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, scaleAnim, opacityAnim]);

    const iconMap = {
        success: { name: "checkmark-circle", color: colors.success },
        error: { name: "close-circle", color: colors.danger },
        warning: { name: "alert-circle", color: colors.warning },
    };

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.modalCardCentered,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    <LinearGradient
                        colors={
                            type === "success"
                                ? ["#22C55E", "#16A34A"]
                                : type === "error"
                                    ? ["#EF4444", "#B91C1C"]
                                    : ["#EAB308", "#CA8A04"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 20,
                            padding: 2,
                        }}
                    >
                        <View
                            style={[
                                styles.modalCardCentered,
                                {
                                    backgroundColor: colors.card,
                                    borderRadius: 18,
                                    padding: 20,
                                },
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <Ionicons
                                    name={iconMap[type].name}
                                    size={38}
                                    color={iconMap[type].color}
                                />
                                <Text style={styles.modalTitle}>{title}</Text>
                            </View>

                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 16,
                                    marginBottom: 20,
                                    textAlign: "center",
                                }}
                            >
                                {message}
                            </Text>

                            <TouchableOpacity
                                onPress={onClose}
                                style={[styles.btnPrimaryRounded, { alignSelf: "center" }]}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.btnPrimaryText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}