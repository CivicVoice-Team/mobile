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
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { detectImage } from "@/services/rekognition";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SKILL_ID } from "@/constants/config";
import { saveImageSearch } from "@/services/saveImage";
import * as ImagePicker from "expo-image-picker";

type RekognitionLabel = {
  name: string;
  confidence: number;
};

type Photo = {
    uri: string;
    width: number;
    height: number;
};  

export default function Camera() {
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<Photo | null>(null);  
  const [labels, setLabels] = useState<RekognitionLabel[]>([]);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isNotInListModalVisible, setIsNotInListModalVisible] = useState(false);
  const [showCameraIntro, setShowCameraIntro] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);

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

  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.8,
  });

  if (!result.canceled && result.assets.length > 0) {
    setPhoto({
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
    });
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

      if (result.image_id) {
        setImageId(result.image_id);
      }

      if (result.image_key) {
        setImageKey(result.image_key);
      }

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

  const selectLabel = async (label: RekognitionLabel) => {
    if (!imageId || !imageKey) {
      console.error("No image ID available");
      return;
    }
    

    try {
      setIsCapturing(true);

      const skillId = SKILL_ID;

      const keywords = labels.map((item) => item.name);

      await saveImageSearch({
        skillId,
        imageId,
        imageKey,
        keywords,
        selectedKeyword: label.name,
      });

      console.log("Image search saved");

      setPhoto(null);
      setLabels([]);
      setImageId(null);
      setImageKey(null);

      router.push({
        pathname: "/faq-search",
        params: {
          query: label.name,
        },
      });
    } catch (err) {
      console.error("Failed to save image search:", err);
    } finally {
      setIsCapturing(false);
    }
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
  };

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
  <View style={styles.cameraScreen}>

    {/* TOP HEADER */}
    <View style={styles.topHeader}>
      <Text style={styles.appTitle}>
        Monroe County Recycling
      </Text>

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          ADAM M. BELLO
        </Text>
      </View>

      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push("/profile")}
      >
        <Ionicons
          name="settings"
          size={23}
          color="white"
        />
      </Pressable>
    </View>


    {/* CAMERA AREA */}
    <View style={styles.cameraArea}>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraFacing}
        enableTorch={flashEnabled}
      />

      {/* FLASH */}
      <Pressable
        style={styles.flashButton}
        onPress={() =>
          setFlashEnabled((current) => !current)
        }
      >
        <Ionicons
          name={flashEnabled ? "flash" : "flash-outline"}
          size={26}
          color="white"
        />
      </Pressable>


      {/* SCANNING BRACKETS */}
      <View style={styles.scanFrame} pointerEvents="none">
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* BACK / CLOSE BUTTON */}
      <Pressable
        style={styles.closeIntroButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="close"
          size={32}
          color="white"
        />
      </Pressable>


      {/* INTRODUCTION OVERLAY */}
      {showCameraIntro && (
        <View style={styles.introOverlay}>

          <Pressable
            style={styles.closeIntroButton}
            onPress={() => setShowCameraIntro(false)}
          >
            <Ionicons
              name="close"
              size={32}
              color="white"
            />
          </Pressable>

          <Ionicons
            name="camera-outline"
            size={48}
            color="#DDEBE7"
          />

          <Text style={styles.introText}>
            Before using our AI camera,
            {"\n"}
            place the item you'd like to
            {"\n"}
            recycle on a well-lit,
            {"\n"}
            contrasting surface.
          </Text>

          <View style={styles.introDivider} />

          <Pressable
            style={styles.continueButton}
            onPress={() => setShowCameraIntro(false)}
          >
            <Text style={styles.continueButtonText}>
              Continue
            </Text>
          </Pressable>

        </View>
      )}

      


      {/* CAMERA CONTROLS */}
      {!showCameraIntro && (
        <View style={styles.cameraControls}>

          {/* GALLERY */}
          <Pressable
            style={styles.sideCameraButton}
            onPress={pickImage}
          >
            <Ionicons
              name="image-outline"
              size={25}
              color="white"
            />
          </Pressable>


          {/* SHUTTER */}
          <Pressable
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureInner} />
          </Pressable>


          {/* FLIP CAMERA */}
          <Pressable
            style={styles.sideCameraButton}
            onPress={() =>
              setCameraFacing((current) =>
                current === 'back'
                  ? 'front'
                  : 'back'
              )
            }
          >
            <Ionicons
              name="sync-outline"
              size={29}
              color="white"
            />
          </Pressable>

        </View>
      )}
    </View>

  </View>
  )}
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  cameraScreen: {
    flex: 1,
    backgroundColor: "#111111",
  },

  topHeader:{
    height: 76,
    backgroundColor: "#2162AE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },

  appTitle:{
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  
  logoContainer:{
    alignItems: "center",
    justifyContent: "center",
    width: 75,
  },

  logoText:{
    color: "white",
    fontSize: 6,
    fontWeight: "800",
    textAlign: "center",
  },

  settingsButton: {
    width: 40,
    alignItems: "flex-end",
  },

  cameraArea: {
    flex: 1,
    marginHorizontal: 14,
    marginTop: 34,
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#222222",
  },

  camera:{
    flex: 1,
  },

  flashButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },

  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "15%",
    right: "15%",
    height: "45%",
  },

  corner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderColor: "#DDEBE7",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 5,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 5,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 5,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 5,
  },

  cameraControls: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  sideCameraButton: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  captureButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E8F5EF",
    borderWidth: 4,
    borderColor: "#B8C8C2",
    alignItems: "center",
    justifyContent: "center",
  },

  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8F5EF",
  },

  bottomNavigation: {
    height: 65,
    backgroundColor: "#2162AE",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navButton: {
    width: 70,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  activeIndicator: {
    position: "absolute",
    bottom: -1,
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
  },

  introOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  closeIntroButton: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 20,
  },

  introText: {
    color: "white",
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 25,
    fontWeight: "500",
  },

  introDivider: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginTop: 14,
    marginBottom: 14,
  },

  continueButton: {
    width: 112,
    height: 28,
    borderRadius: 5,
    backgroundColor: "#1264C5",
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },


  controls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
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
  },
});