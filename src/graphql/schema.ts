import { gql } from "apollo-server-express";

export const typeDefs = gql`
scalar Upload
scalar Date
type User {
    id:Int
    email:String
    accountCode:String
    accountDetails:[AccountDetails]
    password:String
    accountLevel:String
    loginAttemp:String
    macAddress:String
    agentIdentity:String
    image:String
    dateCreated:String
    dateUpdated: String
    nameOfStore: String
  }

  type CrowdMessages {
    id:String
    Messages:String
    Sender:String
    dateSent:String
  }

type AccountDetails {
    id: Int
    userId: String
    fullname: String
    storeName: String
    contactNo: String
    Address: String
    accountEmail: String
  }


type Category{
  id:Int
  Name:String
  status:String
  icon:String
  image:String
}

type ProductTypes{
  id:Int
  Category:String
  Name:String
}

type Brands{
  id:Int
  ProductType:String
  Name:String
}


type Inventory {
  id:Int
  styleCode:String
  productType:String
  category:String
  name:String
  status:String
  dateCreated:String
  dateUpdated:String
  agentEmail:String
  brandname:String
  collectionItem:Boolean
  childInventory:[ChildInventory]
}

type ChildInventory {
  id:Int
  productCode:String
  category:String
  productType:String
  imageReferences:String
  style_Code:String
  name:String
  color:String
  size:String
  price:String
  stock:String
  status:String
  thumbnail:String
  parentId:String
  creator:String
  editor:String
  dateCreated:String
  dateUpdated:String
  agentEmail:String
  subImageFieldOut:[Inv_subImage]
  model: String
}

type Inv_subImage {
  id:Int
  subImageRelationParent:Int
  subImageRelationChild:Int
  ImagePath:String
  isVideo:String
}

type NumberOfViews {
  id:Int
  count:String
  productCode:String
  emailAddress:String
  IpAddress:String
  Country:String
  dateVisited:String
}

type WebsiteVisits {
  id:Int
  IpAddress:String
  Country:String
  dateVisited:String
}

input InputSignup{
  accountEmail:String
}

type Result{
  statusText:String
  jsonToken:String
}

type Ipadd{
  IpAddress:String
}


type Query {
  getUser: [User]
  getIp(ipAddress:String):[Ipadd]
  getAccountDetails: [AccountDetails]
  getAccountDetails_id(id:String):[AccountDetails]
  getParentInventory(EmailAddress:String):[Inventory]
  getChildInventory(skip:String,take:String):[ChildInventory]
  getChildInventory_details(styleCode:String):[ChildInventory]
  getCategory:[Category]
  getProductTypes:[ProductTypes]
  getBrand:[Brands]
  getRelatedProduct:[ChildInventory]
  getToviewProduct(id:Int):[ChildInventory]
  getLogin(username:String,password:String):Result
  getNameofStore:[User]
  getNumberOfViews:[NumberOfViews]
  getWebsitVisits:[WebsiteVisits]
  getInv_subImage:[Inv_subImage]
  messages:[CrowdMessages]
}
type Mutation {
  insertNumberOfVisit(emailAddress:String,IpAddress:String,Country:String):Result
  insertNumberOfViews(count:String,productCode:String,emailAddress:String,IpAddress:String,Country:String):Result
  insertUser(emailAddress:String,password:String):Result
  insertInventory(emailAddress:String):Result
  insertChildInventory(emailAddress:String,styleCode:String):Result
  updateChildInventory(productID:Int,productCode:String,productName:String,productColor:String,productSize:String,productPrice:String,productStatus:String,productStock:String,Email:String):Result
  updateParentInventory(productID:Int,category:String,productType:String,brandname:String,productName:String,status:String):Result
  saveCropImage(id:Int,file:Upload):Result
  scheduleOperation(name:String):String
  postMessage(Message:String,Sender:String):CrowdMessages!
}

type Operation {
  name:String
  endDate:String
}

type Subscription {
  messageAdded:CrowdMessages!
}

`;
