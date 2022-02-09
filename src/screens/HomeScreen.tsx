import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Colors from "../constants/Colors";
import {Divider} from "react-native-elements";
import {FAB} from "react-native-paper";
import {useEffect, useState} from "react";
import * as Location from 'expo-location';
import {MVLocation} from "../models/Location";
import {RootStackScreenProps} from "../models/types";

export default function HomeScreen({navigation}: RootStackScreenProps<'Home'>) {

  const [location, setLocation] = useState<MVLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  interface ListItem {
    id: string,
    label: string,
    size: string
  }

  let DATA: ListItem[] = [
    {
      id: "002342L",
      label: "Ku Ntarama Farm A",
      size: "1.2 Ha"
    },
    {
      id: "002342L6",
      label: "Ku Ntarama Farm A",
      size: "1.2 Ha"
    },
    {
      id: "002342LX",
      label: "Ku Ntarama Farm A",
      size: "1.2 Ha"
    },
    {
      id: "002342L2",
      label: "Ku Ntarama Farm A",
      size: "1.2 Ha"
    },
    {
      id: "002342LZ",
      label: "Ku Ntarama Farm A",
      size: "1.2 Ha"
    },
    {
      id: "002342LM",
      label: "Ku Ntarama Farm A",
      size: "1.2 Ha"
    },
  ]

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let {coords} = await Location.getCurrentPositionAsync({});
      let location: MVLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0922,
      }
      setLocation(location);
      console.log("LOCATION:", location)
    })();
  }, []);

  const renderItem = (item: ListItem) => (
      <View style={styles.listItem}>
        <Text style={{flex: 1, marginEnd: 32}}>{item.id}</Text>
        <Text style={{flex: 3, marginEnd: 32}}>{item.label}</Text>
        <Text style={{flex: 1, marginEnd: 32}}>{item.size}</Text>
      </View>
  )

  return (
      <View style={styles.container}>
        <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={location as MVLocation}
        >
          <View style={styles.mapOverlay}>
            <Text style={{color: "white", fontWeight: "bold", fontSize: 32}}>Wakulima</Text>
          </View>
        </MapView>

        <View style={styles.farmList}>
          <Text style={{fontWeight: "bold", fontSize: 18}}>Farm List</Text>
          <Divider style={{marginVertical: 16}} />
          <View style={{flexDirection: "row", marginHorizontal: 16}}>
            <Text style={{flex: 1, marginEnd: 32}}>#ID</Text>
            <Text style={{flex: 3, marginEnd: 32}}>Label</Text>
            <Text style={{flex: 1, marginEnd: 32}}>Size</Text>
          </View>
          <FlatList
              data={DATA}
              renderItem={({item}) => renderItem(item)}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
          />
        </View>

        <FAB
            style={styles.fab}
            color="white"
            icon="plus"
            onPress={() => navigation.navigate("CapturePolygon")}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  mapOverlay: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: "absolute",
    opacity: 0.7,
    backgroundColor:
    Colors.green,
    // justifyContent: "center",
    paddingTop: 44*3,
    alignItems: "center"
  },
  farmList: {
    height: Dimensions.get('window').height/1.5,
    width: Dimensions.get('window').width,
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    padding: 16,
    position: "absolute",
    bottom: 0,
    backgroundColor: Colors.background
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.greenLight,
    // opacity: 0.2,
    padding: 16,
    marginVertical: 8,
    borderRadius: 8
  },

  fab: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginEnd: 16,
    marginBottom: 32,
    backgroundColor: Colors.green
  }
});
