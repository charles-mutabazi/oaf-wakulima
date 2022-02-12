import {Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Colors from "../constants/Colors";
import {Divider} from "react-native-elements";
import {ActivityIndicator, Chip, FAB, IconButton, Menu, Provider} from "react-native-paper";
import {useEffect, useState} from "react";
import * as Location from 'expo-location';
import {MVLocation} from "../models/Location";
import {RootStackScreenProps} from "../models/types";
import {Farm} from "../models/farms";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../store";
import {globalStyles} from "./styles";
import {currentUser} from "../models/User";
import {findIndex, xor} from "lodash";

export default function HomeScreen({navigation}: RootStackScreenProps<'Home'>) {

    const [location, setLocation] = useState<MVLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [inDeleteMode, setInDeleteMode] = useState(false);
    const [deleteArr, setDeleteArr] = useState<number[]>([]);

    const {farms, geoShapes} = useSelector((state: RootState) => state.farms)
    const isLoading = useSelector((state: RootState) => state.loading.global)
    const dispatch = useDispatch<Dispatch>()

    useEffect(() => {
        (async () => {
            //dispatch.farms.CLEAR_FARMS
            let {status} = await Location.requestForegroundPermissionsAsync();
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
            console.log("Farms:", deleteArr)
        })();
    }, [deleteArr]);

    const renderItem = (item: Farm) => (
        <TouchableOpacity onPress={() => {
            if(!inDeleteMode){
                navigation.navigate("Farm", {farm: item})
            } else {
                setDeleteArr(xor([...deleteArr], [item.id!]))
            }

        }}>
            <View style={[styles.listItem, findIndex(deleteArr, item.id!) !== -1 && {borderWidth: 2, borderColor: Colors.green}]}>
                <Text style={{flex: 1, marginEnd: 32}}>{item.id}</Text>
                <Text style={{flex: 3, marginEnd: 32}}>{item.label}</Text>
                <Text style={{flex: 1, marginEnd: 32}}>{`${(item.size).toFixed(2)} ${item.sizeUnit}`}</Text>
            </View>
        </TouchableOpacity>

    )

    return (
        <Provider>
            <View style={globalStyles.container}>
                <MapView
                    style={[globalStyles.map, {height: Dimensions.get('window').height / 3 + 16}]}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={location as MVLocation}
                >

                </MapView>

                <View style={globalStyles.mapOverlay}>
                    <Text style={{color: "white", fontWeight: "bold", fontSize: 32}}>Wakulima</Text>
                </View>

                <View style={globalStyles.details}>
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                        <Text style={{fontWeight: "bold", fontSize: 18}}>Farm List</Text>

                        {inDeleteMode ?
                            <Chip icon="close" onPress={() => setInDeleteMode(false)}>Cancel</Chip>
                            :
                            <View style={{flexDirection: "row"}}>
                                {!isLoading ?
                                    <IconButton
                                        icon="refresh"
                                        color={Colors.orange}
                                        size={28}
                                        style={{marginEnd: 16}}
                                        onPress={() => dispatch.farms.syncFarms(currentUser.apikey)}
                                    />
                                    :
                                    <ActivityIndicator style={{marginEnd: 16}} color={Colors.orange}/>
                                }

                                <Menu
                                    visible={showMenu}
                                    onDismiss={() => setShowMenu(true)}
                                    anchor={<IconButton
                                        icon="dots-vertical"
                                        color="grey"
                                        size={28}
                                        onPress={() => setShowMenu(true)}
                                    />}
                                >
                                    <Menu.Item
                                        icon="delete"
                                        onPress={() => {
                                            setInDeleteMode(true);
                                            setShowMenu(false)
                                        }}
                                        title="Delete"
                                    />
                                </Menu>
                            </View>
                        }


                    </View>

                    <Divider style={{marginVertical: 16}}/>
                    <View style={{flexDirection: "row", marginHorizontal: 16}}>
                        <Text style={{flex: 1, marginEnd: 32}}>#ID</Text>
                        <Text style={{flex: 3, marginEnd: 32}}>Label</Text>
                        <Text style={{flex: 1, marginEnd: 32}}>Size</Text>
                    </View>

                    <FlatList
                        data={farms}
                        renderItem={({item}) => renderItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                {inDeleteMode ?
                    <FAB
                        style={[styles.fab, {backgroundColor: Colors.red}]}
                        color="white"
                        icon="delete"
                        onPress={() => console.log("delete farms")}
                    />
                    :
                    <FAB
                        style={[styles.fab, {backgroundColor: Colors.green}]}
                        color="white"
                        icon="plus"
                        onPress={() => navigation.navigate("CreateFarm")}
                    />
                }

            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    farmList: {
        height: Dimensions.get('window').height / 1.5,
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
        padding: 16,
        marginVertical: 8,
        borderRadius: 8
    },

    fab: {
        position: "absolute",
        bottom: 0,
        right: 0,
        marginEnd: 16,
        marginBottom: 32
    }
});
