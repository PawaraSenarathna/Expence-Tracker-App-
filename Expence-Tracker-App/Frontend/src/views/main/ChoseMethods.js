import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import Colors from "../../constants/Colors";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import API_LINKS from "../../utils/API_LINKS";

export default function ChoseMethods() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handleFileUpload = async () => {
    setLoading(true); // Start loading
    const userId = await AsyncStorage.getItem("userId");

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"], // Allow images and PDFs
      });

      console.log("DocumentPicker Result:", result);

      const file = result.assets ? result.assets[0] : result;

      if (!file || file.type !== "success") {
        console.log("User canceled file selection.");
        setLoading(false); // Stop loading
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });

      const ocrResponse = await axios.post(
        "https://api.ocr.space/parse/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            apikey: "K83858095388957",
          },
        }
      );

      if (!ocrResponse.data) {
        throw new Error("OCR processing failed");
      }

      const currentTimestamp = new Date(); // Ensure timestamp is defined

      const response = await axios.post(`${API_LINKS.RECORDS}/createByOCR`, {
        label: "Automated note",
        note: "Automated note",
        type: "expense",
        timestamp: currentTimestamp.getTime(),
        user: userId,
        ocrData: ocrResponse.data,
      });

      const data = await response.data;
      navigation.navigate("HomeView");
      return data;
    } catch (error) {
      console.error("File Upload Error:", error);
      Alert.alert("Error", "Failed to process the file.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View
      style={{ flex: 0.075, justifyContent: "center", flexDirection: "row" }}
    >
      {/* Loading Modal */}
      {loading && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color={Colors.BLUE} />
              <Text style={{ marginTop: 10, fontSize: 16 }}>Processing...</Text>
            </View>
          </View>
        </Modal>
      )}

      <View style={{ flexDirection: "row", width: "100%" }}>
        <TouchableOpacity
          style={styles.buttonManual}
          onPress={() => navigation.navigate("AddTransactionView")}
        >
          <Text style={styles.buttonText}>Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonAuto} onPress={handleFileUpload}>
          <Text style={styles.buttonText}>Automatic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  buttonManual: {
    backgroundColor: Colors.BLUE,
    paddingVertical: 10,
    flex: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  buttonAuto: {
    backgroundColor: Colors.GREEN,
    paddingVertical: 10,
    flex: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
};
