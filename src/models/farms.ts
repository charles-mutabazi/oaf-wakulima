import {createModel} from "@rematch/core";
import {RootModel} from "./index";
import {iteratee, uniqBy} from "lodash"
import {deleteRecord, get, post} from "../utils/Api";

export interface CropHarvest {
    cropId: number
    cropLabel: string
    farmId: number
    id?: number
    quantity: number
    quantityUnit: string
    seasonId: number
    seasonLabel: string
    userId: number
    userType: string
}

export interface GeoShape {
    farmId?: number,
    geojson: string,
    id?: number, //<- this is redundant since it is auto generated
    parcelId?: string,
    surfaceArea: number,
    wkt: string
}

export interface Farm {
    id?: number //<- this is redundant since it is auto generated
    label: string
    ownerId: number
    ownerType: string
    size: number
    sizeUnit: string
    userId: number
    userType: string
    uuid: string
    geoShape?: GeoShape []
    geoShapes?: GeoShape []
}

interface FarmState {
    farms: Farm[],
    geoShapes: GeoShape[]
    cropHarvests: CropHarvest[]
}

export const farms = createModel<RootModel>()({
    state: {
        farms: [],
        geoShapes: [],
        cropHarvests: [],
    } as FarmState,

    reducers: {
        ADD_FARM: (state, payload: Farm) => ({
            ...state,
            farms: uniqBy([...state.farms, payload], "id")
        }),

        ADD_FARM_BULK: (state, payload: Farm[]) => ({
            ...state,
            farms: uniqBy([...state.farms, ...payload], "id")
        }),

        ADD_GEO_SHAPE: (state, payload: GeoShape) => ({
            ...state,
            geoShapes: uniqBy([...state.geoShapes, payload], "parcelId")
        }),
        ADD_HARVEST: (state, payload: CropHarvest) => ({
            ...state,
            cropHarvests: uniqBy([...state.cropHarvests, payload], iteratee("id"))
        }),

        // CLEAR_FARMS: (state) => ({
        //     ...state,
        //     farms: [],
        //     geoShapes:[],
        //     cropHarvests: []
        // })
    },

    effects: (dispatch) => {
        const {farms} = dispatch
        return {
            async syncFarms(payload){
                const farmsResponse = await get("/farms", payload)
                    .catch(e => console.log("Error =>", e.message))
                if(farmsResponse) {
                    farms.ADD_FARM_BULK(farmsResponse.data)
                }
            },
            async createFarmEffect(payload: {farm: Farm, apiKey: string, geoShape: GeoShape}): Promise<any> {
                const response = await post("/farms", payload.farm, payload.apiKey)
                    .catch(e => {
                        console.log("ERR", e.message)
                    })

                if(response) {
                    const farm = response.data

                    //create a geoShape
                    let cleanGeoShape =  {
                        ...payload.geoShape,
                        farmId: farm.id,
                        parcelId: "WKM-"+farm.id,
                    }

                    //save the geoshape to the db
                    const gResponse = await post("/geoshapes", cleanGeoShape, payload.apiKey)

                    if(gResponse) {
                        // finally, add both geoShape and farm to the store
                        const gShape = gResponse.data

                        farms.ADD_FARM(farm)
                        farms.ADD_GEO_SHAPE(gShape)
                    }
                }

            },

            async createHarvest(payload: {apiKey: string, harvest: CropHarvest}) {
                const response = await post("/harvests", payload.harvest, payload.apiKey)
                    .catch(e => {
                        console.log("ERR", e.message)
                    })

                if(response) {
                    farms.ADD_HARVEST(response.data)
                }
            },
            deleteFarms({farms, apiKey}: {farms: Farm[], apiKey: string}) {

                farms.forEach(async (farm) => {
                    const res = await deleteRecord("/farms/"+farm.id, apiKey)

                    if(res.status === 200){
                        //TODO: delete crop harvest from store with farm id
                        //TODO: delete geoshape from store with farm id
                        //TODO: delete farm from store with farm id
                    }
                })

            }
            //other effects will go here
        }
    },
})