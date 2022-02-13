import { BarChart } from "react-native-chart-kit";
import {Dimensions, View} from "react-native";
import {useSelector} from "react-redux";
import {RootState} from "../store";

export default function HarvestGraph() {

    const {cropHarvests} = useSelector((state: RootState) => state.farms)

    return(
        <View>
            <BarChart
                data={{
                    labels: ["2016", "2017", "2018", "2019", "2020", "2021"],
                    datasets: [
                        {
                            data: [35, 80, 60, 43, 30, 70]
                        }
                    ]
                }}
                width={Dimensions.get("window").width -32} // from react-native
                height={320}
                fromZero
                yAxisSuffix="T"
                yAxisLabel=""
                chartConfig={{
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
                    decimalPlaces: 1, // optional, defaults to 2dp
                    color: (opacity=0.5) => `rgba(43, 127, 104, ${opacity})`,
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
                style={{
                    marginVertical: 16,
                    borderRadius: 16
                }}
            />
        </View>
    )
}