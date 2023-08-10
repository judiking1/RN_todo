import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color.js";
const STORAGE_KEY = "@toDos";
const WORKING_STORAGE_KEY = "@working";
const DARK_MODE_KEY = "@darkmode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [done, setDone] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadToDos();
  }, []);
  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };
  const deleteAll = () => {
    const newToDos = { ...toDos };
    Object.keys(newToDos).forEach(key => {
      if (newToDos[key].working === working) {
        delete newToDos[key];
      }
    });
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;  // 업데이트될 새로운 값
    setIsDarkMode(newDarkMode); 
    saveDarkMode(newDarkMode);  // 새로운 값을 저장
  };

  const onChangeText = (payload) => setText(payload);

  const saveWorking = async (value) => {
    try {
      await AsyncStorage.setItem(WORKING_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving working state:", error);
    }
  };
  const saveDarkMode = async (value) => {
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving dark mode:", error);
    }
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error("Error saving to-dos:", error);
    }
  };

  const loadToDos = async () => {
    try {
      const [s, w, d] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(WORKING_STORAGE_KEY),
        AsyncStorage.getItem(DARK_MODE_KEY)
      ]);
  
      if (s) setToDos(JSON.parse(s));
      if (w) setWorking(JSON.parse(w));
      if (d) setIsDarkMode(JSON.parse(d));
  
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
    setIsLoading(false);  // 모든 비동기 작업이 완료된 후에 로딩 상태 업데이트
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newKey = `${Date.now()}-${Math.random()}`; // 더 안정적인 키 생성
    const newToDos = {
      ...toDos,
      [newKey]: { text, working, done },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const checkDone = (key) => {
    toDos[key].done = !toDos[key].done;
    const newToDos = { ...toDos };
    setToDos(newToDos);
    saveToDos(newToDos);
  }
  const deleteToDo = (key) => {
    if(Platform.OS==="web"){
      const ok = confirm("do you want to delete this To Do?");
      if(ok){
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    }else{
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    };
  }
  const startEditing = (key) => {
    setEditingKey(key);
  };
  
  const finishEditing = (key, value) => {
    const newToDos = {...toDos};
    newToDos[key].text = value;
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditingKey(null);
  };
  if (isLoading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? (isDarkMode ? "white" : "black") : (isDarkMode ? theme.grey : "lightgray"),  }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? (isDarkMode ? "white" : "black") : (isDarkMode ? theme.grey : "lightgray"),
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView style={styles.list}>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={[styles.toDo, { backgroundColor: isDarkMode ? theme.toDoBg : 'lightgray' }, ]} key={key}>
              {editingKey === key ? (
                <TextInput
                  style={styles.toDoTextEdit}
                  value={toDos[key].text}
                  onChangeText={(newText) => {
                    const newToDos = {...toDos};
                    newToDos[key].text = newText;
                    setToDos(newToDos);
                  }}
                  onSubmitEditing={() => finishEditing(key, toDos[key].text)}
                  autoFocus={true}
                />
              ) : (
                <TouchableOpacity onPress={()=>{checkDone(key)}}  style={styles.toDoText}>
                  <Fontisto name={toDos[key].done?"checkbox-active":"checkbox-passive"} size={18} color={isDarkMode ? "lightgray":theme.grey} />
                  <Text style={[toDos[key].done ? styles.strikeThrough : null, styles.marginLeft, {color:isDarkMode?'white':'black'}]} >{toDos[key].text}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.buttons}>
               <TouchableOpacity onPress={() => startEditing(key)}>
                  <Fontisto name="eraser" size={18} color={isDarkMode ? "lightgray":theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={isDarkMode ? "lightgray":theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Text style={{color: isDarkMode ? 'white' : 'black'}}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteAll}>
          <Text style={{color: isDarkMode ? 'white' : 'black'}}>Delete All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marginLeft:{
    marginLeft:12,
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: '50%', // 화면 중앙에 위치하도록 조정
    color: 'gray',
  },
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
    borderWidth:1,
    borderColor: "lightgray",
  },
  list: {
    flex: 1,
    paddingBottom: 50,
  },
  toDo: {
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flexDirection:"row",
    alignItems:"center",
    width:"85%",
    height:48,
  },
  toDoTextEdit: {
    backgroundColor: "white",
    color: "black",
    fontSize: 16,
    fontWeight:"600",
    width:"60%",
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#d1d1d1",
  },
  buttons: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent:"space-between",
    width:"15%",
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical:20,
    width: '100%',
    paddingHorizontal: 20,
  },
});