import {Models} from "@rematch/core";
import { farms } from "./farms";

export interface RootModel extends Models<RootModel> {
    farms: typeof farms
}

export const models: RootModel = {farms}