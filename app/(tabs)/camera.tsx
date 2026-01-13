import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

const UPLOAD_API = "http://localhost:4000/video/upload";

export default function CameraScreen() {
  const [uploading, setUploading] = useState(false);

  const pickVideo = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      // 1️⃣ Pick video
      const videoUri = await pickVideo();
      if (!videoUri) return;

      // 2️⃣ Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not logged in");

      // 3️⃣ Build FormData (WEB SAFE)
      const formData = new FormData();
      formData.append("video", {
        uri: videoUri,
        type: "video/mp4",
        name: "video.mp4",
      } as any);

      formData.append("userId", user.id);

      // 4️⃣ Upload
      const res = await fetch(UPLOAD_API, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      Alert.alert("Success", "Video uploaded 🚀");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {uploading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Upload Video" onPress={handleUpload} />
      )}
    </View>
  );
}