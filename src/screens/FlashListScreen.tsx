import { ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { FlashList, type FlashListProps } from "@shopify/flash-list";
import { type Product, useProducts } from "api/products";
import { ProductItem } from "components/ProductItem";

const renderItem: FlashListProps<Product>['renderItem'] = ({ item }) => <ProductItem item={item} />;

export const FlashListScreen = () => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, refetch, isRefetching } = useProducts();

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
});
