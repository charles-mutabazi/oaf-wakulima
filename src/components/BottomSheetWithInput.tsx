import {KeyboardAvoidingView, Platform, Text, View} from "react-native";
import {Button} from "react-native-elements";
import Colors from "../constants/Colors";
import {TextInput} from "react-native-paper";
import {isEmpty} from "lodash";
import {useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../store";


interface SheetProps {
    greenButtonTitle: string
    redButtonTitle: string
    onGreenPress: any
    onRedPress: any
    onChangeLabel: any
    hasInput?: boolean
    loading: boolean
}

export default function BottomSheetWithInput(props: SheetProps) {
    const [label, setLabel] = useState("")
    return (
        <KeyboardAvoidingView style={{position: "absolute", bottom:0, width:"100%"}} behavior={Platform.OS == "ios" ? "position": undefined}>

            <View style={{flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "white", borderRadius: 18, margin: 16 }}>
                <View>
                    <Text style={{fontSize: 12, color: "gray"}}>Size</Text>
                    <Text>120 Acre</Text>
                </View>
                <View>
                    <View>
                        <Text style={{fontSize: 12, color: "gray"}}>Date Registered</Text>
                        <Text>12, Feb 2022</Text>
                    </View>
                </View>
            </View>

            <View style={{backgroundColor: "white", padding: 16, paddingBottom: 28, borderTopLeftRadius: 28, borderTopRightRadius: 28}}>

                <TextInput
                    mode="outlined"
                    label='Enter Farm Label*'
                    onChangeText={(label: string) => {
                        props.onChangeLabel(label)
                        setLabel(label)
                    }}
                    activeOutlineColor={Colors.green}
                    style={{backgroundColor: "#EEE"}}
                />
                <View style={{flexDirection: "row", justifyContent:"space-between", marginTop: 28}}>
                    <Button
                        title={props.redButtonTitle}
                        titleStyle={{fontSize: 14}}
                        buttonStyle={{borderRadius: 8, paddingVertical: 12, backgroundColor: Colors.red}}
                        containerStyle={{flex: 1, marginEnd: 8}}
                        onPress={props.onRedPress}
                    />
                    <Button
                        title={props.greenButtonTitle}
                        titleStyle={{fontSize: 14}}
                        buttonStyle={{borderRadius: 8, paddingVertical: 12,  backgroundColor: Colors.green}}
                        containerStyle={{flex: 1, marginStart: 8}}
                        onPress={props.onGreenPress}
                        loading={props.loading}
                        disabled={isEmpty(label) || props.loading}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}