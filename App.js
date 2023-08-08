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
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color.js";
const STORAGE_KEY = "@toDos";
const WORKING_STORAGE_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [done, setDone] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
    Object.keys(toDos).map((key)=>{
      if(toDos[key].working === working){
        
      }
    })
    setToDos({});
    saveToDos({});
  };
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const onChangeText = (payload) => setText(payload);

  const saveWorking = async (value) => {
    try {
      await AsyncStorage.setItem(WORKING_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving working state:", error);
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
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      s !== null ? setToDos(JSON.parse(s)) : null;
      
      const w = await AsyncStorage.getItem(WORKING_STORAGE_KEY);
      w !== null ? setWorking(JSON.parse(w)) : null;
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
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
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
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
        autoFocus={true}
      />
      <ScrollView style={styles.list}>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
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
                <Text 
                style={[
                  styles.toDoText, 
                  toDos[key].done ? styles.strikeThrough : null
                ]}
              >
                {toDos[key].text}
              </Text>
              )}
              <View style={styles.buttons}>
               <TouchableOpacity onPress={() => startEditing(key)}>
                  <Fontisto name="eraser" size={18} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{checkDone(key)}}>
                  <Fontisto name={toDos[key].done?"checkbox-active":"checkbox-passive"} size={18} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
      <View style={styles.footer}>
      <TouchableOpacity onPress={deleteAll}>
        <Text style={{color: isDarkMode ? 'white' : 'black'}}>Delete All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleDarkMode}>
        <Text style={{color: isDarkMode ? 'white' : 'black'}}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  list: {
    flex: 1,
    paddingBottom: 50,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    width:"30%",
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
  }
});