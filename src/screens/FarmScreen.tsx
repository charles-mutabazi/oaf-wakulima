import {useSelector} from "react-redux";
import {RootState} from "../store";
import {globalStyles} from "./styles";
import {FlatList, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, View} from "react-native";
import MapView, {Polygon, PROVIDER_GOOGLE, Region} from "react-native-maps";
import {Icon} from "react-native-elements";
import Colors from "../constants/Colors";
import {RootStackScreenProps} from "../models/types";
import {getFarmGeoJson} from "../utils";
import {useState} from "react";
import {Chip, Divider, Provider, List} from "react-native-paper";
import NewHarvest from "../components/NewHavest";
import {CropHarvest} from "../models/farms";
import {filter, isEmpty} from "lodash";

export default function FarmScreen({navigation, route}: RootStackScreenProps<'Farm'>) {

    const [formVisible, setFormVisible] = useState(false)

    //redux
    const {geoShapes, cropHarvests} = useSelector((state: RootState) => state.farms)


    const {farm} = route.params
    let coordinates = getFarmGeoJson(farm?.id!, geoShapes)

    let farmHarvest = filter(cropHarvests, ["farmId", farm?.id]) || []

    const harvestItem = (item: CropHarvest) => (
        <List.Item
            title={item.cropLabel}
            description={"Season: "+ item.seasonLabel}
            right={props => <Text style={{fontWeight: "bold"}}>{item.quantity +" "+ item.quantityUnit}</Text>}
        />
    )

    return (
        <Provider>
            <View style={globalStyles.container}>
                <MapView
                    style={[globalStyles.map, {height: Dimensions.get('window').height / 3 + 16}]}
                    initialRegion={isEmpty(coordinates) ? undefined : coordinates.initialCoords as Region}
                    mapType="satellite"
                    provider={PROVIDER_GOOGLE}>
                    {!isEmpty(coordinates) &&
                        <Polygon
                            coordinates={coordinates.polygon}
                            fillColor={Colors.orangeTranslucent}
                            strokeColor={Colors.orange}
                            strokeWidth={2}/>
                    }

                </MapView>
                <View style={{position: "absolute", top: 44, left: 0, marginStart: 8}}>
                    <Icon
                        reverse
                        name='arrow-back'
                        type="material"
                        color={Colors.green}
                        onPress={() => navigation.goBack()}
                    />
                </View>

                <KeyboardAvoidingView style={globalStyles.details} behavior={Platform.OS == "ios" ? "position" : undefined}>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <View>
                            <Text style={globalStyles.title}>{farm?.label}</Text>
                            <Text>{farm?.size.toFixed(2) + " " + farm?.sizeUnit}</Text>
                        </View>

                        {!formVisible &&
                            <Chip icon="plus" onPress={() => setFormVisible(true)}>Add Harvest</Chip>
                        }


                    </View>
                    <Divider style={{marginVertical: 20}}/>

                    {!formVisible && farmHarvest.length > 0 &&
                        <>
                            <List.Subheader>Crop Harvests</List.Subheader>
                            <FlatList
                                data={farmHarvest}
                                renderItem={({item}) => harvestItem(item)}
                                keyExtractor={(item, index) => index.toString()}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => <Divider/>}
                            />
                        </>

                    }

                    {formVisible &&
                        <NewHarvest farmId={farm?.id!} showForm={(state: boolean) => setFormVisible(state)}/>
                    }

                </KeyboardAvoidingView>
            </View>
        </Provider>
    )
}

const styles = StyleSheet.create({

});