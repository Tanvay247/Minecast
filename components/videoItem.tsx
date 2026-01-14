import { ResizeMode, Video } from "expo-av";
import { useRef, useState } from "react";
import { Dimensions, Text, View } from "react-native";

const { height, width } = Dimensions.get("window");

export default function VideoItem({ video }: any) {
  const ref = useRef<Video>(null);
  const [ready, setReady] = useState(false);

  return (
    <View style={{ height, width, backgroundColor: "black" }}>
      <Video 
        ref={ref}
        source={{ uri: `https://ipfs.io/ipfs/${video.cid}` }}
        style={{ height: "100%", width: "100%" }}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        onReadyForDisplay={() => setReady(true)}
      />

      {/* Overlay UI */}
      <View
        style={{
          position: "absolute",
          bottom: 80,
          left: 12,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          Rarity: {video.rarityScore.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}