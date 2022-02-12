import axios from "axios";

axios.defaults.baseURL = "https://wakulima.herokuapp.com"
axios.defaults.headers.common["Content-Type"] = "application/json"

export async function post(endpoint:string, body: any, api_key:string) {
    return await axios.post(endpoint, body, {
        headers: {'apiKey': api_key},
    })
}

export async function patch(endpoint:string, body:any, api_key:string) {
    return await axios.patch(endpoint, body, {
        headers: {'apiKey': api_key},
    })
}

export async function get(endpoint:string, api_key :string) {
    return await axios.get(endpoint, {
        headers: {'apiKey': api_key}
    })

}

export async function deleteRecord(endpoint:string, api_key :string) {
    return await axios.delete(endpoint, {
        headers: {'apiKey': api_key}
    })

}
