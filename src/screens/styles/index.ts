import {Dimensions, StyleSheet} from "react-native";
import Colors from "../../constants/Colors";

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
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
    details: {
        backgroundColor: 'white',
        height: Dimensions.get('window').height/2*1.35,
        borderTopRightRadius: 28,
        borderTopLeftRadius: 28,
        position: "absolute",
        bottom: 0,
        width: Dimensions.get('window').width,
        padding: 16,
    }
});