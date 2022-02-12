import {createModel} from "@rematch/core";
import {RootModel} from "./index";
import {filter, find, isEmpty, iteratee, remove, sortedUniqBy, unionBy, uniqBy} from "lodash"
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

interface FarmDeleteType {
    farmIds: number[],
    geoShapes: GeoShape[],
    cropHarvests: CropHarvest[],
    apiKey: string
}

export const farms = createModel<RootModel>()({
    state: {
        farms: [],
        geoShapes: [],
        cropHarvests: [],
    } as FarmState,

    reducers: {
        //FARM REDUCERS
        ADD_FARM: (state, payload: Farm) => ({
            ...state,
            farms: sortedUniqBy(unionBy([...state.farms, payload], "id"), 'id')
        }),

        ADD_FARM_BULK: (state, payload: Farm[]) => ({
            ...state,
            farms: sortedUniqBy(unionBy([...state.farms, ...payload], "id"), 'id')
        }),

        DELETE_FARM: (state, payload: number) => ({
            ...state,
            farms: remove([...state.farms], (obj) => obj['id'] != payload)
        }),

        //GEOSHAPE REDUCERS
        ADD_GEO_SHAPE: (state, payload: GeoShape) => ({
            ...state,
            geoShapes: sortedUniqBy(unionBy([...state.geoShapes, payload], "id"), 'id')
        }),

        DELETE_GEO_SHAPE: (state, payload: number) => ({
            ...state,
            geoShapes: remove([...state.geoShapes], (obj) => obj['id'] != payload)
        }),

        //HARVEST REDUCERS
        ADD_HARVEST: (state, payload: CropHarvest) => ({
            ...state,
            cropHarvests: sortedUniqBy(unionBy([...state.cropHarvests, payload], iteratee("id")), 'id')
        }),

        ADD_HARVEST_BULK: (state, payload: CropHarvest[]) => ({
            ...state,
            harvest: sortedUniqBy(unionBy([...state.farms, ...payload], "id"), 'id')
        }),

        DELETE_HARVEST: (state, payload: number) => ({
            ...state,
            cropHarvests: remove([...state.cropHarvests], (obj) => obj['id'] != payload)
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
                    .catch(e => console.log("Error while fetching farms =>", e.message))
                if(farmsResponse) {
                    farms.ADD_FARM_BULK(farmsResponse.data)
                    // get the geoshape data and crop harvests
                    // await get("/geoshapes", payload) //<- API for getting GeoShapes is not working

                    //get all harvests that were created by me --- via my api key
                    const harvests = await get("/harvests", payload).catch(e => console.log("Unable to fetch crop harvests", e.message))

                    if(harvests) {
                        farms.ADD_HARVEST_BULK(harvests.data)
                    }
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

            async deleteFarms({farmIds, apiKey, geoShapes, cropHarvests}: FarmDeleteType) {

                for (const farmId of farmIds) {

                    //HARVEST OPS
                    let geoShape = find(geoShapes, ['farmId', farmId]) // geoshape to delete
                    if(!isEmpty(geoShape)){
                        //delete geoshape from remote
                        const gRes = await deleteRecord("/geoshapes/"+geoShape?.id, apiKey)
                            .catch(e => console.log("Unable to delete GeoShape", e.message))
                        //delete geoshape from local store
                        if(gRes) {dispatch.farms.DELETE_GEO_SHAPE(geoShape?.id!)}
                    }

                    //HARVEST OPS
                    let cropHarvestsArr = filter(cropHarvests, ['farmId', farmId])
                    if(cropHarvestsArr.length > 0) {
                        for (const harvest of cropHarvestsArr) {
                            const hRes = await deleteRecord("/harvests/"+harvest.id, apiKey)
                                .catch(e => console.log("Unable to delete Harvest", e.message))

                            if(hRes) { dispatch.farms.DELETE_HARVEST(harvest.id!)}
                        }
                    }

                    //FINALLY, DELETE FARM
                    //dispatch.farms.DELETE_FARM(farmId)
                    const fRes = await deleteRecord("/farms/"+farmId, apiKey)
                        .catch(e => console.log("Unable to delete Farm", e.message))
                    if(fRes) {dispatch.farms.DELETE_FARM(farmId)}
                }

            }
            //other effects will go here
        }
    },
})