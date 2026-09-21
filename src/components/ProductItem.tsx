import { Collapsible, Host, Text as UIText } from "@expo/ui";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Product } from "api/products";

export const ProductItem = ({ item }: { item: Product }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={item.thumbnail}
        style={styles.thumbnail}
        contentFit="contain"
        recyclingKey={String(item.id)}
        transition={0}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.footer}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
          <Text style={item.stock > 0 ? styles.inStock : styles.outOfStock}>
            {item.stock > 0 ? `${item.stock} left` : "Out of stock"}
          </Text>
        </View>

        <Host matchContents={{ vertical: true }}>
          <Collapsible isOpen={isOpen} onOpenChange={setIsOpen} label="Details">
            <UIText>{`Brand: ${item.brand ?? "—"}`}</UIText>
            <UIText>{`Category: ${item.category}`}</UIText>
            <UIText>{`Rating: ${item.rating.toFixed(1)}`}</UIText>
            <UIText>{`In stock: ${item.stock}`}</UIText>
          </Collapsible>
        </Host>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    color: "#8E8E93",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  category: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#8E8E93",
  },
  rating: {
    fontSize: 11,
    color: "#FF9500",
  },
  inStock: {
    fontSize: 11,
    color: "#34C759",
  },
  outOfStock: {
    fontSize: 11,
    color: "#FF3B30",
  },
});
