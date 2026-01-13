import { supabase } from '@/utils/supabase';
import { ResizeMode, Video } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');
const BACKEND_URL = 'http://localhost:4000';

export default function FeedScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const currentIndex = useRef(0);
  const videoRefs = useRef<(Video | null)[]>([]);

  /* ---------------- FETCH FEED ---------------- */
  useEffect(() => {
    fetch(`${BACKEND_URL}/video/feed`)
      .then(res => res.json())
      .then(setVideos)
      .catch(console.error);
  }, []);

  /* ---------------- AUTOPLAY HANDLER ---------------- */
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (!viewableItems.length) return;

      const index = viewableItems[0].index;
      if (index === currentIndex.current) return;

      videoRefs.current[currentIndex.current]?.pauseAsync();
      videoRefs.current[index]?.playAsync();

      currentIndex.current = index;
    }
  ).current;

  /* ---------------- LIKE ---------------- */
  const handleLike = async (videoId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await fetch(`${BACKEND_URL}/engagement/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        videoId,
      }),
    });

    // optimistic UI update
    setVideos(vs =>
      vs.map(v =>
        v.id === videoId
          ? {
              ...v,
              engagement: {
                ...v.engagement,
                likeCount: (v.engagement?.likeCount ?? 0) + 1,
              },
            }
          : v
      )
    );
  };

  /* ---------------- SHARE ---------------- */
  const handleShare = async (videoId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await fetch(`${BACKEND_URL}/engagement/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        videoId,
      }),
    });
  };

  return (
    <View className="flex-1 bg-black">

      {/* FEED */}
      <FlatList
        data={videos}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }) => (
          
          <View style={{ height }} className="relative bg-black">
            {/* VIDEO (BACKGROUND) */}
            <Video
              ref={ref => {
                videoRefs.current[index] = ref;
              }}
              source={{ uri: `https://ipfs.io/ipfs/${item.cid}` }}
              className="w-full h-full"
              resizeMode={ResizeMode.COVER}
              shouldPlay={index === 0}
              isLooping
              pointerEvents="none"   // 🔥 REQUIRED FOR EXPO WEB
            />

            {/* ENGAGEMENT OVERLAY */}
            <View className="absolute right-4 bottom-24 z-50 items-center space-y-6 pointer-events-auto">
              
              {/* LIKE */}
              <TouchableOpacity
                onPress={() => handleLike(item.id)}
                className="items-center"
              >
                <Text className="text-white text-3xl">❤️</Text>
                <Text className="text-white text-xs">
                  {item.engagement?.likeCount ?? 0}
                </Text>
              </TouchableOpacity>

              {/* COMMENT (COUNT ONLY FOR NOW) */}
              <TouchableOpacity className="items-center">
                <Text className="text-white text-3xl">💬</Text>
                <Text className="text-white text-xs">
                  {item.engagement?.commentCount ?? 0}
                </Text>
              </TouchableOpacity>

              {/* SHARE */}
              <TouchableOpacity
                onPress={() => handleShare(item.id)}
                className="items-center"
              >
                <Text className="text-white text-3xl">🔗</Text>
                <Text className="text-white text-xs">
                  {item.engagement?.shareCount ?? 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
      />
    </View>
  );
}