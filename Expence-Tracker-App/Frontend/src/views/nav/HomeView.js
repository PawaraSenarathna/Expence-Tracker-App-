import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import Colors from "../../constants/Colors";
import Feather from "react-native-vector-icons/Feather";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import TransactionItem from "../../components/TransactionItem";
import LottieView from "lottie-react-native";
import NoResults from "../../components/NoResults";
import API_LINKS from "../../utils/API_LINKS";

const HomeView = () => {
  const focused = useIsFocused();
  const navigation = useNavigation();
  const [balance, setBalance] = useState();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [goalData, setGoalData] = useState(0);
  const [presentage, setPresentage] = useState(0);

  const fetchBalance = async () => {
    const userId = await AsyncStorage.getItem("userId");
    try {
      setBalanceLoading(true);
      await axios
        .get(`${API_LINKS.RECORDS}/user/${userId}/balance`)
        .then((response) => {
          setBalance(response.data.balance);
        });
      return true;
    } catch (e) {
      Alert.alert("Error!", "Cannot fetch balance");
      return false;
    } finally {
      setRefresh(false);
      setBalanceLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const userId = await AsyncStorage.getItem("userId");
    try {
      setLoading(true);
      await axios
        .get(`${API_LINKS.RECORDS}/user/${userId}`)
        .then((response) => {
          const json = response.data.records.records;
          setTransactions([...json.reverse()]);
        });
      return true;
    } catch (e) {
      Alert.alert(
        "Error!",
        "Cannot load transactions! Please check your internet connection"
      );
      return false;
    } finally {
      setRefresh(false);
      setLoading(false);
    }
  };

  const fetchIncomeGoal = async () => {
    const userId = await AsyncStorage.getItem("userId");
    try {
      const response = await axios.get(
        `${API_LINKS.USER}/income-goal/${userId}`
      );
      setGoalData(response.data.incomeGoal);
      setPresentage(response.data.presentage);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error!",
        "Cannot load transactions! Please check your internet connection"
      );
      return false;
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    fetchTransactions();
    fetchBalance();
    fetchIncomeGoal();
  };

  useEffect(() => {
    focused && fetchBalance() && fetchTransactions() && fetchIncomeGoal();
  }, [focused]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        paddingHorizontal: 10,
      }}
    >
      <View style={{ flex: 0.075, justifyContent: "center" }}>
        <Text
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "700",
            paddingRight: 20,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Home
        </Text>
      </View>
      <View style={{ flex: 0.3, justifyContent: "center" }}>
        <TouchableOpacity style={{ elevation: 8 }}>
          <LinearGradient
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={["#0082c8", "#007AFF", "#007AFF", "#0082c8"]}
          >
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View>
                <Image
                  style={{ height: 50, width: 50 }}
                  source={require("../../../assets/chip_1.png")}
                />
              </View>
              <View style={{ paddingBottom: 10 }}>
                {balanceLoading ? (
                  <ProgressBar indeterminate color={"coral"} />
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.WHITISH,
                        marginBottom: 4,
                      }}
                    >
                      MY BALANCE
                    </Text>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      Rs.{Math.round((balance + Number.EPSILON) * 100) / 100}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {goalData !== 0 && (
        <View
          style={{
            backgroundColor: Colors.NIGHT_PINK,
            borderRadius: 16,
            gap: 8,
            width: "50%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Image
            style={{ height: 45, width: 45, marginLeft: 4 }}
            source={require("../../../assets/miscellaneous.png")}
          />
          <View>
            <Text style={{ fontSize: 17, color: Colors.WHITISH }}>
              Goal: Rs. {goalData}
            </Text>
            <Text style={{ fontSize: 17, color: Colors.WHITISH }}>
              {presentage}% Achieved
            </Text>
          </View>
        </View>
      )}
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: 17, color: Colors.WHITISH }}>
          Recent Transactions
        </Text>
      </View>
      <View style={{ flex: 0.625, marginTop: 15, minHeight: 2 }}>
        {loading ? (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <LottieView
              style={{ width: 100, height: 100 }}
              source={require("../../../assets/loading.json")}
              autoPlay
              loop
            />
          </View>
        ) : (
          <FlatList
            data={transactions.slice(0, 10)}
            keyExtractor={({ _id }) => _id}
            refreshing={refresh}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={NoResults}
            renderItem={({ item }) => <TransactionItem item={item} onDeleteSuccess={onRefresh}/>}
          />
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            requestAnimationFrame(() => {
              navigation.navigate("ChoseMethods");
            })
          }
        >
          <Feather name="plus" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeView;

const styles = StyleSheet.create({
  card: {
    height: "95%",
    backgroundColor: "black",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fab: {
    alignItems: "center",
    justifyContent: "center",
    width: 63,
    height: 63,
    position: "absolute",
    bottom: 40,
    right: 28,
    backgroundColor: Colors.BLUE,
    borderRadius: 100,
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
});
