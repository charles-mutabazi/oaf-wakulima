import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import loading, { ExtraModelsFromLoading } from '@rematch/loading'
import persist from '@rematch/persist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { models, RootModel } from './models'

type FullModel = ExtraModelsFromLoading<RootModel>

export const store = init<RootModel, FullModel>({
    models,
    plugins: [
        loading(),
        persist({
            key: 'root',
            storage: AsyncStorage,
            whitelist: ['farms'],
        }),
    ],
})

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel, FullModel>