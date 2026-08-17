import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { detectImage } from "@/services/rekognition";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type RekognitionLabel = {
  name: string;
  confidence: number;
};

export default function Camera() {
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [labels, setLabels] = useState<RekognitionLabel[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isNotInListModalVisible, setIsNotInListModalVisible] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
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
      const captured = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (captured) {
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

    try {
      setIsCapturing(true);

      const file = new FileSystem.File(photo.uri);
      const base64 = await file.base64();

      const result = await detectImage(base64);

      console.log("Rekognition result:", result);

      // Store the top labels so we can display them to the user.
      if (result.labels && result.labels.length > 0) {
        setLabels(result.labels);
      } else {
        console.log("No labels returned from Rekognition");
      }
    } catch (err) {
      console.error("Failed to analyze image:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const selectLabel = (label: RekognitionLabel) => {
    console.log("Selected label:", label.name);
    console.log("Confidence:", label.confidence);

    // Clear the current photo/labels before navigating.
    setPhoto(null);
    setLabels([]);

    // Use the user's selected Rekognition label
    // as the search term.
    router.push({
      pathname: "/faq-search",
      params: {
        query: label.name,
      },
    });
  };

  const retakePhoto = () => {
    setPhoto(null);
    setLabels([]);
  };

  const handleNotInList = () => {
    setIsNotInListModalVisible(true);
  };

  const retakeFromNotInList = () => {
    setIsNotInListModalVisible(false);
    setPhoto(null);
    setLabels([]);
  };

  const searchManually = () => {
    setIsNotInListModalVisible(false);
    setPhoto(null);
    setLabels([]);
    router.push("/faq-search");
  }

  return (
    <View style={styles.container}>
      {labels.length > 0 ? (
        <View style={styles.resultsContainer}>
          <ScrollView
            style={styles.resultsScroll}
            contentContainerStyle={styles.resultsScrollContent}
          >
            <Pressable onPress={() => setIsImageExpanded(true)}>
              <Image
                source={{ uri: photo?.uri }}
                style={styles.resultImage}
                resizeMode="contain"
              />

              <View style={styles.expandHint}>
                <Ionicons name="expand-outline" size={20} color="white" />
                <Text style={styles.expandHintText}>
                  Tap to expand
                </Text>
              </View>
            </Pressable>

            <View style={styles.resultsContent}>
              <Text style={styles.resultsTitle}>
                What is this item?
              </Text>

              <Text style={styles.resultsSubtitle}>
                Select the option that best matches your item.
              </Text>

              <View style={styles.labelList}>
                {labels.map((label, index) => (
                  <Pressable
                    key={`${label.name}-${index}`}
                    style={styles.labelButton}
                    onPress={() => selectLabel(label)}
                  >
                    <Text style={styles.labelName}>
                      {label.name}
                    </Text>

                    <Text style={styles.confidence}>
                      {Math.round(label.confidence)}%
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={[styles.actionButton, styles.notInListButton]}
                onPress={handleNotInList}
              >
                <Text style={styles.actionButtonText}>
                  My item isn't in this list
                </Text>
              </Pressable>
            </View>
          </ScrollView>
          <Modal
            visible={isImageExpanded}
            transparent
            animationType="fade"
            onRequestClose={() => setIsImageExpanded(false)}
          >
            <View style={styles.imageModal}>
              <Pressable
                style={styles.closeImageButton}
                onPress={() => setIsImageExpanded(false)}
              >
                <Ionicons name="close" size={30} color="white" />
              </Pressable>

              <Image
                source={{ uri: photo?.uri }}
                style={styles.expandedImage}
                resizeMode="contain"
              />
            </View>
          </Modal>
          <Modal
            visible={isNotInListModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsNotInListModalVisible(false)}
          >
            <View style={styles.choiceModalOverlay}>
              <View style={styles.choiceModal}>
                <Text style={styles.choiceModalTitle}>
                  Item not found?
                </Text>

                <Text style={styles.choiceModalText}>
                  You can retake the photo or search for your item manually.
                </Text>

                <Pressable
                  style={[styles.modalActionButton, styles.useButton]}
                  onPress={retakeFromNotInList}
                >
                  <Text style={styles.actionButtonText}>
                    Retake Photo
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modalActionButton, styles.searchButton]}
                  onPress={searchManually}
                >
                  <Text style={styles.actionButtonText}>
                    Search Manually
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setIsNotInListModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      ) : photo ? (
        // ----------------------------------------
        // PHOTO PREVIEW SCREEN
        // ----------------------------------------
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.camera}
            resizeMode="cover"
          />

          <View style={styles.previewControls}>
            <Pressable
              style={[styles.actionButton, styles.retakeButton]}
              onPress={retakePhoto}
              disabled={isCapturing}
            >
              <Text style={styles.actionButtonText}>
                Retake
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.useButton]}
              onPress={usePhoto}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.actionButtonText}>
                  Use Photo
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        // ----------------------------------------
        // CAMERA SCREEN
        // ----------------------------------------
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
              disabled={isCapturing}
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

  // ----------------------------------------
  // PHOTO PREVIEW
  // ----------------------------------------

  previewContainer: {
    flex: 1,
  },

  previewControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  // ----------------------------------------
  // LABEL RESULTS
  // ----------------------------------------

  resultsContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  resultImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#111"
  },

  resultsContent: {
    flex: 1,
    padding: 20
  },

  resultsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 0,
  },

  resultsSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 0,
  },

  labelList: {
    padding: 10,
    gap: 10
  },

  labelButton: {
    backgroundColor: "#456781",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  labelName: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },

  confidence: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },

  // ----------------------------------------
  // ACTION BUTTONS
  // ----------------------------------------

  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  retakeButton: {
    backgroundColor: "#666",
  },

  useButton: {
    backgroundColor: "#456781",
  },

  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  resultsScroll: {
    flex: 1
  },

  resultsScrollContent: {
    paddingBottom: 30
  },

  expandHint: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },

  expandHintText: {
    color: "white",
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "600",
  },

  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center"
  },

  expandedImage: {
    width: "100%",
    height: "100%"
  },
  
  closeImageButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center"
  },

  notInListButton: {
    backgroundColor: "#456781",
    marginTop: 10,
    alignItems: "center"
  },

  choiceModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },

  choiceModal: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24
  },

  choiceModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8
  },

  choiceModalText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#666",
    marginBottom: 20
  },

  modalActionButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10
  },

  searchButton: {
    backgroundColor: "#456781"
  },
  
  cancelButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600"
  }
});