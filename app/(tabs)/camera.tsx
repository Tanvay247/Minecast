import * as ImagePicker from "expo-image-picker";
import { Alert, Button, Platform, View } from "react-native";

export default function Camera() {
  const uploadVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (result.canceled) return;

    const video = result.assets[0];

    const formData = new FormData();
    formData.append("video", {
      uri: video.uri,
      name: "video.mp4",
      type: "video/mp4",
    } as any);

    formData.append("userId", "test-user-1");

    const API_URL =
      Platform.OS === "web"
        ? "http://localhost:4000"
        : "http://10.125.178.53:4000";

    const res = await fetch(`${API_URL}/video/upload`, {
      method: "POST",
      body: formData,
    });

    const text = await res.text();

    if (!res.ok) {
      Alert.alert("Upload failed", text);
      return;
    }

    Alert.alert("Uploaded!", "Video uploaded successfully");
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Button title="Pick & Upload Video" onPress={uploadVideo} />
    </View>
  );
}