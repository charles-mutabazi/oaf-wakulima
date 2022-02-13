import { LineChart } from "react-native-chart-kit";
import {Dimensions, Text, View} from "react-native";

//TODO: Implement dynamic data from the api
export default function WeatherGraph() {
    return(
        <View>
            <Text>Rainfall (mm)</Text>
            <LineChart
                data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    datasets: [
                        {
                            data: [
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                                Math.random() * 100,
                            ]
                        }
                    ]
                }}
                width={Dimensions.get("window").width -32} // from react-native
                height={320}
                yAxisInterval={10} // optional, defaults to 1
                chartConfig={{
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
                    decimalPlaces: 1, // optional, defaults to 2dp
                    color: (opacity=0.5) => `rgba(25, 118, 210, ${opacity})`,
                    labelColor: () => `#BBBBBB`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        // stroke: "#ffa726"
                    }
                }}
                bezier
                style={{
                    marginVertical: 16,
                    borderRadius: 16
                }}
            />
        </View>
    )
}