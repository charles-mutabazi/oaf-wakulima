import {Text, View} from "react-native";
import {Button} from "react-native-elements";
import Colors from "../constants/Colors";


interface SheetProps {
    title: string
    description: string
    greenButtonTitle: string
    redButtonTitle: string
    onGreenPress: any
    onRedPress: any
}

export default function PromptBottomSheet(props: SheetProps) {
    return (
        <View style={{backgroundColor: "white", position: "absolute", bottom:0, width:"100%", borderTopLeftRadius: 28, borderTopRightRadius: 28}}>
            <View style={{padding: 16, marginBottom: 44}}>
                <Text style={{fontWeight: "bold", marginBottom: 16}}>{props.title}</Text>
                <Text>{props.description}</Text>
                <View style={{flexDirection: "row", justifyContent:"space-between", marginTop: 32}}>
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
                    />
                </View>
            </View>
        </View>
    )
}