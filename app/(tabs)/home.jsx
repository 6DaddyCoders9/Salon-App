import {
  FlatList,
  Text,
  View,
  Image,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import EmptyState from "../../components/EmptyState";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";

const Home = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePress = (id) => {
    router.push(`/service-center/${id}`);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back,
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logo}
                  className="w-[150px] -top-8"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Centers Found"
            subtitle="Don't worry, We are finding you the best deals!"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 mb-4"
            onPress={() => handlePress(item.$id)}
          >
            <View className="bg-gray-700 p-4 rounded-lg shadow-md">
              <Text className="text-gray-50 text-lg font-semibold">
                {item.title}
              </Text>
              <Image
                source={{ uri: item.thumbnail }}
                className="w-full h-48 mt-4 rounded-lg"
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Home;
