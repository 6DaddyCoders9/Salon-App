import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router"; // Use this to get route params
import useAppwrite from "../../lib/useAppwrite";
import { getServiceCenterById } from "../../lib/appwrite";
import CustomButton from "../../components/CustomButton";
import MapView, { Marker } from "react-native-maps";

const ServiceCenterDetail = () => {
  const { id } = useLocalSearchParams(); // Get the ID from route params
  const [serviceCenter, setServiceCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceCenter = async () => {
      try {
        const data = await getServiceCenterById(id);
        setServiceCenter(data);
      } catch (error) {
        console.error("Failed to fetch service center:", error.message); // More descriptive error
      } finally {
        setLoading(false);
      }
    };

    fetchServiceCenter();
  }, [id]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    ); // Show a loading message or spinner

  if (!serviceCenter)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-white">Service Center not found</Text>
      </View>
    ); // Handle no data case

  return (
    <View className="flex-1 bg-primary">
      <ScrollView contentContainerStyle="flex-grow px-4 py-6">
        <Image
          source={{ uri: serviceCenter.thumbnail }}
          className="w-full h-48 rounded-lg top-10"
        />
        <Text className="text-4xl top-10 font-semibold my-4 text-white left-5 underline">
          {serviceCenter.title}
        </Text>
        <View className="mt-5 ml-5 ">
          <Text className="text-white text-xl font-pregular mt-5">
            Location 📍
          </Text>
          <View
            className="my-4"
            style={{
              height: 175,
              width: 350,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: serviceCenter.latitude,
                longitude: serviceCenter.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: serviceCenter.latitude,
                  longitude: serviceCenter.longitude,
                }}
                title={serviceCenter.title}
                description={serviceCenter.address}
              />
            </MapView>
          </View>
          <Text className="text-white text-xl font-pregular mt-5">Phone:</Text>
          <Text className="font-bold text-white text-xl font-pregular mt-1">
            {serviceCenter.phone}
          </Text>
          <Text className="text-white text-xl font-pregular mt-2">Email:</Text>
          <Text className="font-bold text-white text-xl font-pregular mt-1">
            {serviceCenter.email}
          </Text>
          <View className="mt-5">
            <Text className="text-white text-xl font-pregular mb-1">
              Operating Hours:
            </Text>
            {Object.entries(serviceCenter.operating_hours).map(([day, hours], index) => (
              <Text key={index} className="text-white text-xl font-bold mt-1">
                {day}: {hours}
              </Text>
            ))}
          </View>
          <View className="mt-5">
            <Text className="text-white text-xl font-pregular mb-1">
              Services:
            </Text>
            {serviceCenter.services.map((service, index) => (
              <Text key={index} className="text-white text-xl font-bold mt-1">
                {service}
              </Text>
            ))}
          </View>
          <Text className="text-white text-xl font-pregular mt-4">Rating:</Text>
          <Text className="text-white font-bold text-3xl mt-2">
            {serviceCenter.rating} / 5 ⭐
          </Text>
        </View>
      </ScrollView>
      <CustomButton
        title="BOOK APPOINTMENT"
        handlePress={() => router.push(`./BookingPage?id=${serviceCenter.$id}`)}
        containerStyles="w-full mt-7"
      />
    </View>
  );
};

export default ServiceCenterDetail;
