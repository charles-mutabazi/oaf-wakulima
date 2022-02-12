import {Dimensions, StyleSheet, Text, View} from "react-native";
import MapView, {LatLng, Marker, Polygon, PROVIDER_GOOGLE} from "react-native-maps";
import {useEffect, useState} from "react";
import {MVLocation} from "../models/Location";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";
import {RootStackScreenProps} from "../models/types";
import Colors from "../constants/Colors";
import uuid from 'react-native-uuid';
import {Icon} from "react-native-elements";
import PromptBottomSheet from "../components/PromptBottomSheet";
import BottomSheetWithInput from "../components/BottomSheetWithInput";
import {Farm, GeoShape} from "../models/farms";
import {currentUser} from "../models/User";
import {getGeojson, getPolygonArea} from "../utils";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../store";

const ASPECT_RATIO = Dimensions.get('window').width / Dimensions.get('window').height
const LATITUDE_DELTA = 0.002866
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

export default function CreateFarmScreen({navigation}: RootStackScreenProps<'CreateFarm'>) {
    const [currentLocation, setCurrentLocation] = useState<MVLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPrompt, setShowPrompt] = useState(false);
    const [savePrompt, setSavePrompt] = useState(false);
    const [recordState, setRecordState] = useState(false);
    const [farmLabel, setFarmLabel] = useState<string>('');
    const [polyCoords, setPolyCoords] = useState<LatLng[]>([])
    const [marker, setMarker] = useState<LatLng>({latitude: 40.741895, longitude:-73.989308})

    const isLoading = useSelector((state: RootState) => state.loading.models.farms)


    const dispatch = useDispatch<Dispatch>()

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let {coords} = await Location.getCurrentPositionAsync({accuracy:LocationAccuracy.Highest});
            let location: MVLocation = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            }
            setCurrentLocation(location);
            setMarker({latitude: coords.latitude, longitude: coords.longitude})
            //console.log("LOCATION:", location)
        })();

    }, []);


    const handleSaveFarm = async () => {
        // const farmId = Date.now() // <- using this throws and error - bigger than int32
        const farmId = Math.floor(Math.random() * 999999999);

        const geoShape: GeoShape = {
            geojson: getGeojson(polyCoords),
            parcelId: "WKM-"+farmId,
            surfaceArea: getPolygonArea(polyCoords),
            wkt: ""
        }

        const currentFarm: Farm = {
            geoShape: [geoShape],
            geoShapes: [geoShape],
            label: farmLabel,
            userId: currentUser.id,
            userType: currentUser.userType,
            uuid: uuid.v4().toString(),
            ownerId: 0,
            ownerType: "farmer",
            size: getPolygonArea(polyCoords),
            sizeUnit: "sqm"
        }

        await dispatch.farms.createFarmEffect({farm:currentFarm, apiKey: currentUser.apikey, geoShape})
        if(!isLoading) {
            navigation.goBack()
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                pitchEnabled={!recordState}
                scrollEnabled={!recordState}
                loadingEnabled={true}
                provider={PROVIDER_GOOGLE}
                initialRegion={currentLocation as MVLocation}
                mapType="satellite"
                userLocationAnnotationTitle="Your Location"
                showsUserLocation={true}
                onPress={(e) => setMarker(e.nativeEvent.coordinate)}
            >
                {recordState && (
                    <Marker
                        coordinate={marker}
                        draggable={true}
                        onDragStart={(e) => setPolyCoords([...polyCoords, e.nativeEvent.coordinate])}
                        onDragEnd={(e) => {
                            setPolyCoords([...polyCoords, e.nativeEvent.coordinate])
                        }}
                    >
                        <Icon name="place" type="material" size={50} color={Colors.red}/>
                    </Marker>
                )}

                {polyCoords.length > 0 &&
                    <Polygon
                        coordinates={polyCoords}
                        strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                        fillColor={Colors.orange}
                    />
                }

            </MapView>
            <View style={{position: "absolute", top: 44, left: 0, marginStart: 8}} >
                <Icon
                    reverse
                    name='arrow-back'
                    type="material"
                    color={Colors.green}
                    onPress={() => navigation.goBack()}
                />
            </View>

            {recordState && (
                <View
                    style={{
                        position: "absolute",
                        top: 64,
                        right: 0,
                        marginEnd: 8,
                        paddingVertical: 8,
                        backgroundColor: Colors.red,
                        paddingHorizontal: 16,
                        borderRadius: 100
                    }} >
                    <Text style={{color: "white"}}>Recording</Text>
                </View>
            )}

            <View style={{
                position: "absolute",
                bottom: 34,
                width: "95%",
                justifyContent: "space-between",
                alignContent: "center",
                flexDirection: "row",
            }} >
                <Icon
                    reverse
                    name='delete'
                    type="material"
                    color={Colors.background}
                    iconStyle={{color: Colors.red}}
                    disabled={polyCoords.length == 0}
                    onPress={() => setShowPrompt(true)}
                />

                <Icon
                    reverse
                    name={recordState ? 'pause-circle-outline' : 'radio-button-checked'}
                    type="material"
                    color={recordState ? Colors.red : Colors.background}
                    iconStyle={{color: recordState ? Colors.background : Colors.red}}
                    onPress={() => setRecordState(!recordState)}
                />

                <Icon
                    reverse
                    name='done'
                    type="material"
                    color={Colors.background}
                    iconStyle={{color: Colors.green}}
                    onPress={() => setSavePrompt(true)}
                />
            </View>

            {showPrompt &&
                <PromptBottomSheet
                    title="Note that your data will be lost!"
                    description="Are you sure you want to delete the captured data?"
                    greenButtonTitle="No Keep On"
                    redButtonTitle="Yes Got It"
                    onGreenPress={() => setShowPrompt(false)}
                    onRedPress={() => {
                        setPolyCoords([])
                        setRecordState(false)
                        setShowPrompt(false)
                    }}
                />
            }

            {savePrompt &&
                <BottomSheetWithInput
                    greenButtonTitle="Save"
                    redButtonTitle="Discard"
                    loading={isLoading}
                    onGreenPress={() => handleSaveFarm()}
                    onRedPress={() => setSavePrompt(false)}
                    onChangeLabel={(label: string) => setFarmLabel(label)}
                />
            }

        </View>
    )
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
})