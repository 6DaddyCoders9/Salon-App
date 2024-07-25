import React, { useState, useEffect } from "react";
import { View, Text, Alert, Platform, ScrollView ,ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getServiceCenterById, bookAppointment } from "../../lib/appwrite";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";

const BookingPage = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [serviceCenter, setServiceCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceCenter = async () => {
      try {
        const data = await getServiceCenterById(id);
        setServiceCenter(data);
      } catch (error) {
        console.error("Failed to fetch service center:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceCenter();
    }
  }, [id]);

  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      const newDate = date || new Date();
      setSelectedDate((prevDate) => {
        const updatedDate = new Date(prevDate);
        updatedDate.setFullYear(newDate.getFullYear());
        updatedDate.setMonth(newDate.getMonth());
        updatedDate.setDate(newDate.getDate());
        return updatedDate;
      });
      setShowDatePicker(false);
      if (!showTimePicker) {
        setShowTimePicker(true);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event, time) => {
    if (event.type === "set") {
      const newTime = time || new Date();
      setSelectedDate((prevDate) => {
        const updatedDate = new Date(prevDate);
        updatedDate.setHours(newTime.getHours());
        updatedDate.setMinutes(newTime.getMinutes());
        return updatedDate;
      });
      setShowTimePicker(false);
    } else {
      setShowTimePicker(false);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === "ios") {
      setShowDatePicker(true);
    } else if (Platform.OS === "android") {
      import("@react-native-community/datetimepicker").then(
        ({ DateTimePickerAndroid }) => {
          DateTimePickerAndroid.open({
            mode: "date",
            value: selectedDate,
            onChange: (event, date) => handleDateChange(event, date),
          });
        }
      );
    }
  };

  //   const openTimePicker = () => {
  //     if (Platform.OS === "ios") {
  //       setShowTimePicker(true);
  //     } else if (Platform.OS === "android") {
  //       import("@react-native-community/datetimepicker").then(
  //         ({ DateTimePickerAndroid }) => {
  //           DateTimePickerAndroid.open({
  //             mode: "time",
  //             value: selectedDate,
  //             onChange: (event, time) => handleTimeChange(event, time),
  //           });
  //         }
  //       );
  //     }
  //   };

  const handleBookAppointment = async () => {
    try {
      if (!serviceCenter) {
        Alert.alert("Error", "Service center information is not available.");
        return;
      }
      await bookAppointment(user.$id, serviceCenter.$id, selectedDate);
      Alert.alert("Success", "Appointment booked successfully!");
      router.push("../(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to book appointment. Please try again.");
      console.error(error);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

  if (!serviceCenter) return <Text>Service Center not found</Text>;

  return (
    <View className="flex-1 mt-10 bg-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <Text className="text-4xl font-bold mb-4 text-white">
          {serviceCenter.title}
        </Text>
        <Text className="text-lg text-white mb-4">
          Book a time slot at your convenience{"\n"}and confirm!
        </Text>
        <CustomButton
          title="Select Date & Time"
          handlePress={openDatePicker}
          containerStyles="w-full h-12 bg-secondary mb-5"
        />
        {/* <CustomButton
          title="Select Time"
          handlePress={openTimePicker}
          containerStyles="w-full h-12 bg-secondary mb-10"
        /> */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date)}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, time) => handleTimeChange(event, time)}
          />
        )}
        <Text className="text-xl font-regular text-white">
          Selected Date and Time:{" "}
        </Text>
        <Text className="text-secondary font-bold text-3xl mt-4">
          {selectedDate.toLocaleString()}
        </Text>
      </ScrollView>
      <CustomButton
        title="Book Appointment"
        handlePress={handleBookAppointment}
        containerStyles="w-full h-12 bg-secondary"
      />
    </View>
  );
};

export default BookingPage;
