import {Text, View} from "react-native";
import {Avatar} from "react-native-paper";

interface Props {
    text: string
    iconName?: string
}
export default function (props: Props) {
    return (
        <View style={{marginVertical: 90, justifyContent: "center", alignItems: "center"}}>
            {props.iconName &&
                <Avatar.Icon
                    icon={props.iconName}
                    size={48}
                    color="white"
                    style={{marginBottom: 16, backgroundColor: "#bbb"}}
                />
            }
            <Text style={{fontWeight: "bold", textAlign: "center", color: "grey"}}>
                {props.text}
            </Text>
        </View>
    )
}