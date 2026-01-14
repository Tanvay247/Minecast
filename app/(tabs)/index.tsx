import { API_BASE } from "@/utils/api";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  View,
} from "react-native";

const API = `${API_BASE}/api/video/feed`;
const { height } = Dimensions.get("window");

let feedCache: any[] | null = null;
let feedFetched = false;

export default function Feed() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // ✅ Use cached data if available
    if (feedFetched && feedCache) {
      setVideos(feedCache);
      return;
    }

    const fetchFeed = async () => {
      try {
        setLoading(true);

        const res = await fetch(API);
        const data = await res.json();

        if (!mounted.current) return;

        const safeVideos = Array.isArray(data?.videos)
          ? data.videos
          : [];

        feedCache = safeVideos;
        feedFetched = true;

        setVideos(safeVideos);
      } catch {
        // 🔕 SILENTLY IGNORE (Expo Go transport noise)
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    fetchFeed();

    return () => {
      mounted.current = false;
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>
          No videos yet
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      pagingEnabled
      snapToInterval={height}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View
          style={{
            height,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>
            Video ID: {item.id}
          </Text>
        </View>
      )}
    />
  );
}