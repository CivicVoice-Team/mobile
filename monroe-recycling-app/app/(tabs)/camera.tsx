import { useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { detectImage } from "@/services/rekognition";
import { useRouter } from "expo-router";

export default function Camera() {
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera access is required.</Text>

        <Pressable
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const captured = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      if(captured) {
        setPhoto(captured);
      }
    } catch (err) {
      console.error("Failed to capture photo:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const usePhoto = async () => {
    console.log("Use Photo pressed");

    if (!photo) {
      console.log("No photo available");
      return;
    }

    console.log("Photo URI:", photo.uri);

    if (!photo) return;

    try {
      setIsCapturing(true);

      const file = new FileSystem.File(photo.uri);

      const base64 = await file.base64();

      const result = await detectImage(base64);

      console.log("Rekognition result:", result);

      if (result.label) {
        router.push({
          pathname: "/faq-search",
          params: {
            query: result.label
          }
        });
      }
    } catch (err) {
      console.error("Failed to analyze image:", err);
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.camera}
            resizeMode="cover"
          />

          <View style={styles.previewControls}>
            <Pressable
              style={[styles.actionButton, styles.retakeButton]}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.actionButtonText}>Retake</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.useButton]}
              onPress={usePhoto}
            >
              <Text style={styles.actionButtonText}>Use Photo</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />

          <View style={styles.controls}>
            <Pressable
              style={styles.captureButton}
              onPress={takePicture}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  controls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "#ccc",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#456781",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  previewContainer: {
    flex: 1,
  },

  previewControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly"
  },

  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12
  },

  retakeButton: {
    backgroundColor: "#666"
  },

  useButton: {
    backgroundColor: "#456781"
  },

  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});