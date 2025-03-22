import React, { useEffect, useState } from "react";
import {
  Text,
  StatusBar,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TextInput } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "../../constants/Colors";
import axios from "axios";
import API_LINKS from "../../utils/API_LINKS";

const ProfileView = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [expenseLimit, setExpenseLimit] = useState(0);
  const [incomeGoal, setIncomeGoal] = useState(0);

  const handleLimitSave = async () => {
    if (
      typeof expenseLimit !== "string" &&
      expenseLimit !== currentUser.expenseLimit
    ) {
      try {
        setLoading(true);
        await axios.put(`${API_LINKS.USER}/expense-limit/${currentUser._id}`, {
          limit: expenseLimit,
        });
        navigation.goBack();
        setLoading(false);
      } catch (error) {
        console.log(error);
        Alert.alert("Error!", "Unable to update expense limit!");
      }
    }
    if (
      typeof incomeGoal !== "string" &&
      incomeGoal !== currentUser.incomeGoal
    ) {
      try {
        setLoading(true);
        await axios.put(`${API_LINKS.USER}/income-goal/${currentUser._id}`, {
          amount: incomeGoal,
        });
        navigation.goBack();
        setLoading(false);
      } catch (error) {
        console.log(error);
        Alert.alert("Error!", "Unable to update income goal!");
      }
    }
  };

  const fetchCurrentUser = async () => {
    try {
      await AsyncStorage.getItem("userId")
        .then(async (userId) => {
          await axios
            .get(`${API_LINKS.USER}/${userId}`)
            .then((response) => {
              setCurrentUser(response.data.user);
              setExpenseLimit(response.data.user.expenseLimit || 0);
              setIncomeGoal(response.data.user.incomeGoal || 0);
            })
            .catch((e) => {
              Alert.alert("", "Error!");
            });
        })
        .catch((e) => {
          Alert.alert("", "Error!");
        });
    } catch (err) {
      Alert.alert("Error!", "Cannot load profile details");
    } finally {
      setRefresh(false);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    fetchCurrentUser();
  };

  const logout = async () => {
    setLoading(true);
    const keys = ["user", "userId"];
    try {
      await AsyncStorage.multiRemove(keys).then(async () => {
        navigation.reset({
          index: 0,
          routes: [{ name: "AuthNavigator" }],
        });
        return true;
      });
    } catch (err) {
      Alert.alert("Error!", "");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutAlert = () => {
    Alert.alert(
      "Confirmation",
      "Do you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => logout(),
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    isFocused && fetchCurrentUser();
  }, [isFocused]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{
          flex: 0.075,
          alignItems: "center",
          justifyContent: "space-between",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Text style={{ color: "white", fontSize: 30, fontWeight: "700" }}>
          My Profile
        </Text>
        <TouchableOpacity
          disabled={loading ? true : false}
          onPress={() => logoutAlert()}
        >
          {loading ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text style={styles.btnText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={{ height: 10 }} />
      <ScrollView
        style={{ flex: 0.925 }}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={Colors.DARK_GRAY}
            />
            <Text style={{ fontSize: 17, marginStart: 10, color: "white" }}>
              {currentUser ? currentUser.name : "loading..."}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <MaterialCommunityIcons
              name="email"
              size={24}
              color={Colors.DARK_GRAY}
            />
            <Text style={{ fontSize: 17, marginStart: 10, color: "white" }}>
              {currentUser ? currentUser.email : "loading..."}
            </Text>
          </View>
        </View>
        <View style={{ height: 15 }} />
        <View style={styles.profileContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={24}
              color={Colors.DARK_GRAY}
            />
            <Text style={{ fontSize: 17, marginStart: 10, color: "white" }}>
              {currentUser
                ? currentUser.records.length.toString() + " Transactions"
                : "loading..."}
            </Text>
          </View>
        </View>
        <View>
          <View
            style={{
              flex: 0.075,
              alignItems: "center",
              justifyContent: "space-between",
              display: "flex",
              flexDirection: "row",
              marginTop: 24,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
              }}
            >
              Expense Limit
            </Text>
            <TouchableOpacity
              disabled={loading ? true : false}
              onPress={() => setExpenseLimit(0)}
            >
              {loading ? (
                <ActivityIndicator color={"white"} />
              ) : (
                <Text style={styles.btnText}>Reset</Text>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            style={{
              width: "100%",
              backgroundColor: Colors.DARK,
              marginVertical: 10,
            }}
            placeholder="Amount*"
            placeholderTextColor={Colors.DARK_GRAY}
            outlineColor={Colors.DARK_GRAY}
            activeUnderlineColor={Colors.BLUE}
            theme={{ colors: { text: "white" } }}
            mode="flat"
            keyboardType="numeric"
            left={<TextInput.Icon name="numeric" color={Colors.DARK_GRAY} />}
            value={
              expenseLimit.toString() === "0"
                ? undefined
                : expenseLimit.toString()
            }
            onChangeText={(text) => {
              let value;
              if (text === "") {
                value = 0;
              } else {
                value = text;
              }
              setExpenseLimit(Number.parseFloat(value));
            }}
          />
        </View>

        <View>
          <View
            style={{
              flex: 0.075,
              alignItems: "center",
              justifyContent: "space-between",
              display: "flex",
              flexDirection: "row",
              marginTop: 24,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
              }}
            >
              Income goal
            </Text>
            <TouchableOpacity
              disabled={loading ? true : false}
              onPress={() => setIncomeGoal(0)}
            >
              {loading ? (
                <ActivityIndicator color={"white"} />
              ) : (
                <Text style={styles.btnText}>Reset</Text>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            style={{
              width: "100%",
              backgroundColor: Colors.DARK,
              marginVertical: 10,
            }}
            placeholder="Amount*"
            placeholderTextColor={Colors.DARK_GRAY}
            outlineColor={Colors.DARK_GRAY}
            activeUnderlineColor={Colors.BLUE}
            theme={{ colors: { text: "white" } }}
            mode="flat"
            keyboardType="numeric"
            left={<TextInput.Icon name="numeric" color={Colors.DARK_GRAY} />}
            maxLength={8}
            value={
              incomeGoal.toString() === "0" ? undefined : incomeGoal.toString()
            }
            onChangeText={(text) => {
              let value;
              if (text === "") {
                value = 0;
              } else {
                value = text;
              }
              setIncomeGoal(Number.parseFloat(value));
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.btnUpdate}
          onPress={() =>
            requestAnimationFrame(() => {
              handleLimitSave();
            })
          }
        >
          {loading ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileView;

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    backgroundColor: Colors.DARK,
    padding: 10,
    borderRadius: 4,
    elevation: 4,
  },
  btnText: {
    alignSelf: "flex-end",
    color: Colors.NIGHT_RED,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 4,
  },
  btnUpdate: {
    height: 50,
    width: "100%",
    backgroundColor: Colors.BLUE,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    flexDirection: "row",
  },
});
