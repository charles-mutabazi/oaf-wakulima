import {Geojson, LatLng} from "react-native-maps";
import Colors from "../constants/Colors";
import {getAreaOfPolygon, getCenter} from 'geolib';
import {GeolibInputCoordinates} from "geolib/es/types";
import {GeoShape} from "../models/farms";
import {find, isEmpty} from "lodash";
import GeoJSON, {GeoJsonObject} from "geojson";

export const getGeojson = (polygonArr: LatLng[]): string => {
    //geojson format
    let format: GeoJSON.Feature= {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: polygonArr.map(point => [point.latitude, point.longitude]) as unknown as GeoJSON.Position[][]
        },
        properties: {
            fill: Colors.orange,
        }
    }

    return JSON.stringify(format)
}

/**
 * Calculates the area of the polygon
 * @param polygonArr - arr of coordinates that make up a polygon
 * @return number - returns the area of a polygon in sqm
 */
export const getPolygonArea = (polygonArr: LatLng[]): number => {
    const coordsArr: GeolibInputCoordinates[] = polygonArr.map(point => [point.latitude, point.longitude])
    return getAreaOfPolygon(coordsArr)
}

export const getFarmGeoJson = (farmId: number, storeGeoShapes: GeoShape[]) => {
    if(isEmpty(storeGeoShapes)){
        return {}
    }
    let gShape = find(storeGeoShapes, ["farmId", farmId]) as GeoShape
    if(isEmpty(gShape)){
        return {}
    }
    let geojson =  JSON.parse(gShape.geojson)



    let polygon = geojson.geometry.coordinates.map((latLng: number[]) => ({latitude:latLng[0], longitude: latLng[1]}))
    let centerCoords = getCenter(polygon) //<- geolib awesome package...

    let initialCoords = {
        ...centerCoords,
        latitudeDelta: 0.0008,
        longitudeDelta: 0.0008,
    }
    //
    //console.log("POLYGON =>", polygon)
    //
    return {polygon, initialCoords}
}