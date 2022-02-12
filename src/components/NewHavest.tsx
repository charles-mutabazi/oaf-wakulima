import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Divider, Menu, TextInput} from "react-native-paper";
import {Button} from "react-native-elements";
import Colors from "../constants/Colors";
import {useState} from "react";
import {CropHarvest} from "../models/farms";
import {currentUser} from "../models/User";
import {isEmpty} from "lodash";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../store";

export default function NewHarvest(props:{farmId: number, showForm: any}) {

    //component states
    const [qtty, setQtty] = useState("")
    const [cropLabel, setCropLabel] = useState("")
    const [visible, setVisible] = useState({
        year: false,
        season: false,
        unit: false,
        form: false
    });
    const [year, setYear] = useState("");
    const [season, setSeason] = useState("");
    const [unit, setUnit] = useState("");

    //redux
    const isLoading = useSelector((state:RootState) => state.loading.models.farms)
    const dispatch = useDispatch<Dispatch>()



    const openMenu = (key: number) => {
        switch (key) {
            case 1:
                return setVisible({...visible, year: true})
            case 2:
                return setVisible({...visible, season: true})
            case 3:
                return setVisible({...visible, unit: true})
            default:
                return setVisible({season: false, unit: false, year: false, form: true})
        }
    };

    const closeMenu = (key: number) => {
        switch (key) {
            case 1:
                return setVisible({...visible, year: false})
            case 2:
                return setVisible({...visible, season: false})
            case 3:
                return setVisible({...visible, unit: false})
            default:
                return setVisible({season: false, unit: false, year: false, form: true})
        }
    };

    const handleHarvestSubmit = async () => {
        let payload = {
            harvest: {
                cropId: 0,
                cropLabel: cropLabel.trim(),
                farmId: props.farmId,
                quantity: Number(qtty),
                quantityUnit: unit,
                seasonId: 0,
                seasonLabel: season,
                userId: currentUser.id,
                userType: currentUser.userType
            } as CropHarvest,
            apiKey: currentUser.apikey
        }

        await dispatch.farms.createHarvest(payload)

        if(!isLoading) {
            resetStates()
        }

    }

    const resetStates = () => {
        setYear("")
        setUnit("")
        setSeason("")
        setCropLabel("")
        setQtty("")

        //close form
        setVisible({...visible, form: false}) //close form after submit
        props.showForm(visible.form)
    }

    const isValidForm = () => {
      return (
          !isEmpty(year) && !isEmpty(season) && !isEmpty(cropLabel.trim()) && qtty > 0 && !isEmpty(unit)
      )
    }


    return(
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{}}>
            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <Text>Year</Text>
                <Menu
                    visible={visible.year}
                    onDismiss={() => closeMenu(1)}
                    anchor={<TouchableOpacity
                        onPress={() => openMenu(1)}>
                        <Text style={{fontSize: 16, fontWeight: "bold"}}>
                            {isEmpty(year) ? "Select Year" : year}
                        </Text></TouchableOpacity>}
                >
                    <Menu.Item onPress={() => {
                        setYear("2022");
                        closeMenu(1)
                    }} title="2022"/>
                    <Menu.Item onPress={() => {
                        setYear("2021");
                        closeMenu(1)
                    }} title="2021"/>
                    <Menu.Item onPress={() => {
                        setYear("2020");
                        closeMenu(1)
                    }} title="2020"/>
                    <Menu.Item onPress={() => {
                        setYear("2019");
                        closeMenu(1)
                    }} title="2019"/>
                </Menu>
            </View>

            <Divider style={{marginVertical: 20}}/>

            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <Text>Season</Text>
                <Menu
                    visible={visible.season}
                    onDismiss={() => closeMenu(2)}
                    anchor={<TouchableOpacity
                        onPress={() => openMenu(2)}>
                        <Text style={{fontSize: 16, fontWeight: "bold"}}>
                            {isEmpty(season) ? "Enter Season" : season}
                        </Text></TouchableOpacity>}
                >
                    <Menu.Item onPress={() => {
                        setSeason("Dry Season");
                        closeMenu(2)
                    }} title="Dry Season"/>
                    <Menu.Item onPress={() => {
                        setSeason("Rainy Season");
                        closeMenu(2)
                    }} title="Rainy Season"/>
                </Menu>
            </View>

            <Divider style={{marginVertical: 20}}/>
            <TextInput
                label="Enter crop label"
                mode="outlined"
                value={cropLabel}
                onChangeText={(val) => setCropLabel(val)}
            />

            <Divider style={{marginVertical: 20}}/>

            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <TextInput
                    label="Quantity"
                    mode="outlined"
                    value={qtty}
                    keyboardType={"numeric"}
                    style={{flex: 3}}
                    onChangeText={(val) => setQtty(val)}
                />
                <View style={{flex: 1, marginStart: 16}}>
                    <Menu
                        visible={visible.unit}
                        onDismiss={() => closeMenu(3)}
                        anchor={<TouchableOpacity
                            onPress={() => openMenu(3)}>
                            <Text style={{fontWeight:"bold"}}>
                                {isEmpty(unit) ? "Select Unit" : unit}
                            </Text></TouchableOpacity>}>

                        <Menu.Item onPress={() => {
                            setUnit("Kilograms");
                            closeMenu(3)
                        }} title="Kilograms"/>
                        <Menu.Item onPress={() => {
                            setUnit("Tones");
                            closeMenu(3)
                        }} title="Tones"/>
                        <Menu.Item onPress={() => {
                            setUnit("Mega Tones");
                            closeMenu(3)
                        }} title="Mega Tones"/>
                    </Menu>
                </View>

            </View>

            <View style={{flexDirection: "row", justifyContent:"space-between", marginVertical: 28}}>
                <Button
                    title="Cancel"
                    titleStyle={{fontSize: 14}}
                    buttonStyle={{borderRadius: 8, paddingVertical: 12, backgroundColor: Colors.red}}
                    containerStyle={{flex: 1, marginEnd: 8}}
                    onPress={resetStates}
                />
                <Button
                    title="Submit"
                    titleStyle={{fontSize: 14}}
                    buttonStyle={{borderRadius: 8, paddingVertical: 12,  backgroundColor: Colors.green}}
                    containerStyle={{flex: 1, marginStart: 8}}
                    onPress={async () => await handleHarvestSubmit()}
                    loading={isLoading}
                    disabled={!isValidForm() || isLoading}
                />
            </View>
        </ScrollView>
    )
}