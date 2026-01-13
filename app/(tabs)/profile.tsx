import { supabase } from '@/utils/supabase';
import { ResizeMode, Video } from 'expo-av';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BACKEND_URL = 'http://localhost:4000';

export default function ProfileScreen() {
  const [username, setUsername] = useState('User');
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;

        const uid = data.user.id;
        setUserId(uid);
        setUsername(data.user.user_metadata?.username ?? 'User');

        const [
          followCountRes,
          followingCountRes,
          isFollowingRes,
          videoCountRes,
          userVideosRes,
        ] = await Promise.all([
          fetch(`${BACKEND_URL}/follow/${uid}/followers`),
          fetch(`${BACKEND_URL}/follow/${uid}/following`),
          fetch(`${BACKEND_URL}/follow/${uid}/is-following?followerId=${uid}`),
          fetch(`${BACKEND_URL}/video/count/${uid}`),
          fetch(`${BACKEND_URL}/video/user/${uid}`),
        ]);

        if (followCountRes.ok) {
          const data = await followCountRes.json();
          setFollowers(data.count);
        }

        if (followingCountRes.ok) {
          const data = await followingCountRes.json();
          setFollowing(data.count);
        }

        if (isFollowingRes.ok) {
          const data = await isFollowingRes.json();
          setIsFollowing(data.isFollowing);
        }

        if (videoCountRes.ok) {
          const data = await videoCountRes.json();
          setVideoCount(data.count);
        }

        if (userVideosRes.ok) {
          const vids = await userVideosRes.json();
          setVideos(vids);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const toggleFollow = async () => {
    if (!userId) return;

    const method = isFollowing ? 'DELETE' : 'POST';

    await fetch(`${BACKEND_URL}/follow/${userId}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
    });

    setIsFollowing(prev => !prev);
    setFollowers(prev => (isFollowing ? prev - 1 : prev + 1));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-6 pt-16">
      {/* LOGOUT */}
      <TouchableOpacity
        onPress={handleLogout}
        className="absolute top-10 right-4 bg-white px-4 py-2 rounded-full z-50"
      >
        <Text className="text-black font-semibold">Logout</Text>
      </TouchableOpacity>

      {/* USERNAME */}
      <Text className="text-white text-3xl font-bold mb-6">
        @{username}
      </Text>

      {/* STATS */}
      <View className="flex-row justify-around mb-8">
        <View className="items-center">
          <Text className="text-white text-xl font-semibold">
            {videoCount}
          </Text>
          <Text className="text-gray-400 text-sm">Videos</Text>
        </View>

        <View className="items-center">
          <Text className="text-white text-xl font-semibold">
            {followers}
          </Text>
          <Text className="text-gray-400 text-sm">Followers</Text>
        </View>

        <View className="items-center">
          <Text className="text-white text-xl font-semibold">
            {following}
          </Text>
          <Text className="text-gray-400 text-sm">Following</Text>
        </View>
      </View>

      {/* FOLLOW TOGGLE */}
      <TouchableOpacity
        onPress={toggleFollow}
        className={`py-4 rounded-xl ${
          isFollowing ? 'bg-gray-700' : 'bg-white'
        }`}
      >
        <Text
          className={`text-center font-semibold ${
            isFollowing ? 'text-white' : 'text-black'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>

      {/* VIDEOS */}
      <View className="mt-10">
        <Text className="text-white text-lg font-semibold mb-4">
          Videos
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {videos.map(video => (
            <View
              key={video.id}
              className="w-[32%] aspect-9/16 mb-2 bg-gray-800"
            >
              <Video
                source={{ uri: `https://ipfs.io/ipfs/${video.cid}` }}
                className="w-full h-full"
                resizeMode={ResizeMode.COVER}
                isMuted
                shouldPlay={false}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}