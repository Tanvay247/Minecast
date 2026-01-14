import { API_BASE } from "@/utils/api";
import { supabase } from "@/utils/supabase";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [username, setUsername] = useState("User");
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
        setUsername(data.user.user_metadata?.username ?? "User");

        const [
          followCountRes,
          followingCountRes,
          isFollowingRes,
          videoCountRes,
          userVideosRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/follow/${uid}/followers`),
          fetch(`${API_BASE}/follow/${uid}/following`),
          fetch(`${API_BASE}/follow/${uid}/is-following?followerId=${uid}`),
          fetch(`${API_BASE}/video/count/${uid}`),
          fetch(`${API_BASE}/video/user/${uid}`),
        ]);

        if (followCountRes.ok) {
          const d = await followCountRes.json();
          setFollowers(d.count);
        }

        if (followingCountRes.ok) {
          const d = await followingCountRes.json();
          setFollowing(d.count);
        }

        if (isFollowingRes.ok) {
          const d = await isFollowingRes.json();
          setIsFollowing(d.isFollowing);
        }

        if (videoCountRes.ok) {
          const d = await videoCountRes.json();
          setVideoCount(d.count);
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

    const method = isFollowing ? "DELETE" : "POST";

    await fetch(`${API_BASE}/follow/${userId}`, {
      method,
      headers: { "Content-Type": "application/json" },
    });

    setIsFollowing((prev) => !prev);
    setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* USERNAME */}
      <Text style={styles.username}>@{username}</Text>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{videoCount}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* FOLLOW BUTTON */}
      <TouchableOpacity
        style={[
          styles.followBtn,
          isFollowing ? styles.following : styles.follow,
        ]}
        onPress={toggleFollow}
      >
        <Text
          style={[
            styles.followText,
            isFollowing ? styles.followingText : styles.followTextDark,
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>

      {/* VIDEOS */}
      <View style={styles.videosSection}>
        <Text style={styles.videosTitle}>Videos</Text>

        <View style={styles.videoGrid}>
          {videos.map((video) => (
            <View key={video.id} style={styles.videoBox}>
              <Video
                source={{ uri: `https://ipfs.io/ipfs/${video.cid}` }}
                style={styles.video}
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  loader: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    position: "absolute",
    top: 40,
    right: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 50,
  },
  logoutText: {
    color: "#000",
    fontWeight: "600",
  },
  username: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  follow: {
    backgroundColor: "#fff",
  },
  following: {
    backgroundColor: "#444",
  },
  followText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  followTextDark: {
    color: "#000",
  },
  followingText: {
    color: "#fff",
  },
  videosSection: {
    marginTop: 16,
  },
  videosTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  videoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  videoBox: {
    width: "32%",
    aspectRatio: 9 / 16,
    backgroundColor: "#222",
    marginBottom: 8,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});