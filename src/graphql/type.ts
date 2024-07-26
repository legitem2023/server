export type User = {
    id:number
    email?:string
    accountCode?:string
    password?:string
    accountDetails?:[AccountDetails]
    accountLevel?:string
    loginAttemp?:string
    macAddress?:string
    agentIdentity?:string
    image?:string
    dateCreated?:string
    dateUpdated?: string
  }

export type AccountDetails = {
    id: number
    fullname: String
    storeName: String
    contactNo: String
    published: String
    userId: String
    accountEmail: String
  }
