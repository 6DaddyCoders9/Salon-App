import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text, Button, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getUserVisitedServiceCenters, signOut, cancelAppointment } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "../../components/EmptyState";
import InfoBox from "../../components/InfoBox";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: visitedServiceCenters, loading, refetch } = useAppwrite(() =>
    getUserVisitedServiceCenters(user.$id)
  );
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = (id) => {
    router.push(`/service-center/${id}`);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      Alert.alert("Appointment Cancelled", "Your appointment has been cancelled successfully.");
      refetch(); // Refresh the data after cancelling the appointment
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      Alert.alert("Error", "Failed to cancel appointment. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={visitedServiceCenters}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 mb-4"
            onPress={() => handlePress(item.$id)}
          >
            <View className="bg-gray-800 p-4 rounded-lg shadow-md">
              <Text className="text-lg font-semibold text-secondary">{item.title}</Text>
              <Text className="text-gray-200 mt-2 text-lg">
                Phone: {item.phone}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg">
                E-mail: {item.email}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg">
                Status: {item.appointmentStatus}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg pb-5">
                Date: {formatDateTime(item.appointmentDate)}
              </Text>

              <TouchableOpacity
                className = "bg-secondary-200 rounded-xl min-h-[62px] justify-center items-center "
                onPress={() => handleCancel(item.appointmentId)}
              >
                <Text className="text-primary font-psemibold text-lg">
                  Cancel Appointment
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <EmptyState
            title="No Centers visited yet :("
            subtitle="Visit a center and let us know your experience!"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              subtitle={user?.email}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
