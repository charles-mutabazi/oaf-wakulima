import {Dimensions, StyleSheet, Text, View} from "react-native";
import MapView, {LatLng, Marker, Polygon, PROVIDER_GOOGLE} from "react-native-maps";
import {useEffect, useState} from "react";
import {MVLocation} from "../models/Location";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";
import {Coords, RootStackScreenProps} from "../models/types";
import Colors from "../constants/Colors";
import {Divider, Button, Icon} from "react-native-elements";
import PromptBottomSheet from "../components/PromptBottomSheet";

const ASPECT_RATIO = Dimensions.get('window').width / Dimensions.get('window').height
const LATITUDE_DELTA = 0.002866
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

export default function CaptureMapPolygon({navigation}: RootStackScreenProps<'CapturePolygon'>) {
    const [currentLocation, setCurrentLocation] = useState<MVLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [showPrompt, setShowPrompt] = useState<boolean>(false);
    const [recordState, setRecordState] = useState<boolean>(false);
    const [polyCoords, setPolyCoords] = useState<LatLng[]>([])
    const [marker, setMarker] = useState<LatLng>({latitude: 40.741895, longitude:-73.989308})



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



    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                pitchEnabled={!recordState}
                scrollEnabled={!recordState}

                provider={PROVIDER_GOOGLE}
                region={currentLocation as MVLocation}
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
                        borderRadius: "100%"
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
                    onPress={() => navigation.goBack()}
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