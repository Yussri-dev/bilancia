// src/components/CustomDrawerContent.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/authContext";

export default function CustomDrawerContent(props) {
    const { user, logout } = useAuth();

    return (
        <View style={{ flex: 1, backgroundColor: "#0B1221" }}>
            <DrawerContentScrollView {...props}>
                <View style={{ padding: 20, borderBottomWidth: 1, borderColor: "#1E293B" }}>
                    {user ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                                source={{
                                    uri: user.avatarUrl || "https://i.pravatar.cc/100",
                                }}
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    marginRight: 12,
                                }}
                            />
                            <View>
                                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                                    {user.username || "Utilisateur"}
                                </Text>
                                <Text style={{ color: "#7C3AED" }}>En ligne</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={{ color: "#999" }}>Non connecté</Text>
                    )}
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {user && (
                <View style={{ padding: 20, borderTopWidth: 1, borderColor: "#1E293B" }}>
                    <TouchableOpacity
                        onPress={logout}
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Ionicons name="log-out" size={20} color="#E11D48" />
                        <Text style={{ color: "#E11D48", marginLeft: 10, fontWeight: "600" }}>
                            Déconnexion
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
