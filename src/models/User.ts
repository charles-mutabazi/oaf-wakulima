export interface User {
    id: number
    apikey: string
    email: string
    name: string
    role: number
    status: string
    userId: number
    userType: string
    uuid: string
}

export const currentUser: User = {
    id: 10,
    role: 1,
    name: "Mutabazi Charles",
    email: "charl.mutabazi@gmail.com",
    apikey: "8af57356-fe7b-4cda-96d7-eb00225df0d5",
    uuid: "Y2hhcmwubXV0YWJhemlAZ21haWwuY29t",
    status: "A",
    userType: "candidate",
    userId: 10
}