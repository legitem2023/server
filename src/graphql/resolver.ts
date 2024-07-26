import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { User } from "./type.js";
import https from 'https';

import { uploadFileToAmazons3 } from "./lib/aws.js";
import { PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { subscribe } from "diagnostics_channel";

import { PubSub } from "graphql-subscriptions";


const pubsub = new PubSub();
const MESSAGE_ADDED: any = [];

const SCOPE = ['https://www.googleapis.com/auth/drive'];

const prisma = new PrismaClient();
// const mockLongLastingOperation = (name: any) => {
//   setTimeout(() => {
//     pubsub.publish('Message', { operationFinished: { name, endDate: new Date().toDateString() } })
//   }, 1000)
// }

const messages: any = [];

const subscribers: any = [];

const onMessagesUpdates = (fn: any) => subscribers.push(fn)

export const resolvers = {
  Query: {
    getInv_subImage: async (parent?: any, args?: any) => {
      try {
        return await prisma.inv_subImage.findMany();
      } catch (error) {
        console.log(error);
      }
    },
    getUser: async (parent?: any, args?: any) => {
      try {
        return await prisma.user.findMany({
          include: {
            accountDetails: true
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    getAccountDetails: async (parent?: any, args?: any) => {
      try {
        const data = await prisma.accountDetails.findMany();
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getAccountDetails_id: async (parent?: any, args?: any) => {
      try {
        console.log(args.id)
        const data = await prisma.accountDetails.findMany({
          where: {
            userId: args.id
          }
        });
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getParentInventory: async (parent?: any, args?: any) => {
      try {
        const data = await prisma.inventory.findMany({
          where: {
            agentEmail: args.EmailAddress
          },
          include: {
            childInventory: true
          }
        });
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getChildInventory: async (parents?: any, args?: any) => {
      try {
        const skip = args.skip;
        const take = args.take;
        const data = await prisma.childInventory.findMany({
          where: {
            status: "Active"
          }
        });
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getChildInventory_details: async (parents?: any, args?: any) => {
      try {
        const data = await prisma.childInventory.findMany({
          where: {
            style_Code: args.styleCode
          }
        });
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getCategory: async (parents?: any, args?: any) => {
      try {
        const data = await prisma.category.findMany();
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getProductTypes: async (parents?: any, args?: any) => {
      return await prisma.productTypes.findMany()
    },
    getBrand: async (parents?: any, args?: any) => {
      return await prisma.brandname.findMany();
    },
    getRelatedProduct: async (parents?: any, args?: any) => {
      try {
        const skip = args.skip;
        const take = args.take;
        const data = await prisma.childInventory.findMany();
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getToviewProduct: async (parents?: any, args?: any) => {
      try {
        const id = args.id;
        const data = await prisma.childInventory.findMany({
          take: 1,
          where: {
            id: parseInt(id)
          }
        });
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    getLogin: async (parent?: any, args?: any) => {
      try {
        const unique = await prisma.user.findUnique({
          where: {
            email: args.username,
          }
        })
        console.log(unique);
        if (unique) {
          let encrypedpassword: any = unique.password;
          const decrypt = await bcrypt.compare(args.password, encrypedpassword);
          if (decrypt == true) {
            const response_data = await prisma.user.findMany({
              where: {
                email: args.username,
                password: encrypedpassword
              }
            })
            const user = {
              id: response_data[0].id,
              userLevel: response_data[0].accountLevel,
              iconSrc: response_data[0].image,
              emailAddress: response_data[0].email,
              isLoginUsingAdmin: true
            }

            const jwt_token: any = process.env.JWT_ACCESS_TOKEN_SECRET;
            const token = jwt.sign({ user: user, }, jwt_token, { expiresIn: '24h' })

            return {
              jsonToken: token,
              statusText: `Welcome!`
            }
          } else {
            return {
              jsonToken: "token",
              statusText: `Login Failed!`
            }
          }

        }
      } catch (error) {
        console.log(error);
      }
    },
    getNameofStore: async (parent?: any, args?: any) => {
      try {
        return await prisma.user.findMany({
          where: {
            accountLevel: "Merchant"
          },
          include: {
            accountDetails: true
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    getNumberOfViews: async (parent?: any, args?: any) => {
      return await prisma.numberOfViews.findMany();
    },
    getWebsitVisits: async (parent?: any, args?: any) => {
      return await prisma.websiteVisits.findMany();
    },
    getIp: async (parent?: any, args?: any) => {
      const ipadd = args.ipAddress;
      const ipData = await new Promise((resolve, reject) => {
        const url = `https://api.ip2location.io/?key=11AD281BE74BE72DABDFCBC298BBF47C&ip=${ipadd}&format=json`;
        let response = "";

        const req = https.get(url, (res) => {
          res.on("data", (chunk) => (response = response + chunk));
          res.on("end", () => {
            resolve(response);
          });
        });

        req.on("error", (err) => {
          reject(err);
        });
      });
      console.log(await ipData, ipadd);
      return await ipData;
    },
    messages: async (parent?: any, args?: any) => {
      try {
        const messages = await prisma.crowdMessages.findMany({
          orderBy: {
            dateSent: 'desc'
          }
        });
        pubsub.publish(MESSAGE_ADDED, { messageAdded: messages });
        return messages;
      } catch (error) {
      }
    }
  },
  Mutation: {
    insertNumberOfVisit: async (parent: any, args: any) => {
      const date_today = new Date();
      const yy = date_today.getFullYear();
      const mm = date_today.getMonth() + 1;
      const dd = date_today.getDay();
      const dateData = `${yy}/${mm}/${dd}`;
      const data = await prisma.websiteVisits.findMany({
        where: {
          IpAddress: args.IpAddress,
          dateVisited: dateData
        }
      })
      if (data.length < 1) {
        await prisma.websiteVisits.create({
          data: {
            IpAddress: args.IpAddress,
            Country: args.Country,
            dateVisited: dateData
          }
        })
      }
    },
    insertNumberOfViews: async (parent: any, args: any) => {
      try {
        const date_today = new Date();
        const yy = date_today.getFullYear();
        const mm = date_today.getMonth() + 1;
        const dd = date_today.getDay();
        const dateData = `${yy}/${mm}/${dd}`;
        const data = await prisma.numberOfViews.findMany({
          where: {
            productCode: args.productCode,
            dateVisited: dateData
          }
        })
        if (data.length < 1) {
          await prisma.numberOfViews.create({
            data: {
              count: args.count,
              productCode: args.productCode,
              emailAddress: args.emailAddress,
              IpAddress: args.IpAddress,
              Country: args.Country,
              dateVisited: dateData
            }
          })
        }
      } catch (error) {

      }
    },
    insertUser: async (parent: any, args: User) => {
      try {
        //*****************************************************//
        var date = new Date();
        var YYYY = date.getFullYear();
        var MMMM = date.getMonth();
        var DDDD = date.getDay();
        var hh = date.getHours();
        var mm = date.getMinutes();
        var ss = date.getSeconds();
        var emailAddress: any = args.email;
        var passWord: any = args.password;
        const account_acct_code = "Acct" + "-" + YYYY + "-" + MMMM + "-" + DDDD + "-" + hh + "-" + mm + "-" + ss;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(passWord, salt);
        const d = new Date();
        var init = 'AC';
        var mm = d.getMinutes()
        var ss = d.getSeconds();
        //*****************************************************//
        const filter = await prisma.user.findMany({
          where: {
            email: emailAddress
          }
        })
        if (filter.length > 0) {
          return {
            statusText: "This Email is already taken"
          }
        } else {
          await prisma.user.create({
            data: {
              email: emailAddress,
              accountCode: account_acct_code,
              password: hash,
              accountLevel: "Merchant",
            },
            include: {
              accountDetails: true
            }
          })

          // await prisma.accountDetails.create({
          //   data:{
          //     accountEmail: emailAddress,
          //   }
          // })
          return {
            statusText: "Successfully"
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    insertInventory: async (parent: any, args: any) => {
      var date = new Date();
      var YYYY = date.getFullYear();
      var MMMM = date.getMonth();
      var DDDD = date.getDay();
      var hh = date.getHours();
      var mm = date.getMinutes();
      var ss = date.getSeconds();
      var emailAddress: any = args.emailAddress;

      const stl = "Style_" + YYYY + "-" + MMMM + "-" + DDDD + "-" + hh + "-" + mm + "-" + ss;
      await prisma.inventory.create({
        data: {
          styleCode: stl,
          productType: "",
          category: "",
          name: "",
          status: "InActive",
          agentEmail: emailAddress,
          brandname: "",
          collectionItem: false
        }
      })

      await prisma.childInventory.create({
        data: {
          style_Code: stl,
          price: 0,
          stock: 0,
          status: "Active",
          creator: emailAddress,
          editor: emailAddress,
          agentEmail: emailAddress
        }
      })
    },
    insertChildInventory: async (parent: any, args: any) => {
      var date = new Date();
      var YYYY = date.getFullYear();
      var MMMM = date.getMonth();
      var DDDD = date.getDay();
      var hh = date.getHours();
      var mm = date.getMinutes();
      var ss = date.getSeconds();
      var emailAddress: any = args.emailAddress;
      var styleCode: any = args.styleCode;
      await prisma.childInventory.create({
        data: {
          style_Code: styleCode,
          price: 0,
          stock: 0,
          status: "Active",
          creator: emailAddress,
          editor: emailAddress,
          agentEmail: emailAddress
        }
      })
    },
    updateParentInventory: async (parent: any, args: any) => {
      var date = new Date();

      await prisma.inventory.update({
        where: {
          id: args.productID
        },
        data: {
          productType: args.productType,
          category: args.category,
          name: args.productName,
          status: args.status,
          dateUpdated: date,
          brandname: args.brandname
        }
      })
    },
    updateChildInventory: async (parent: any, args: any) => {

      var date = new Date();
      await prisma.childInventory.update({
        where: {
          id: args.productID
        },
        data: {
          productCode: args.productCode,
          name: args.productName,
          color: args.productColor,
          size: args.productSize,
          price: parseFloat(args.productPrice),
          stock: parseInt(args.productStock),
          status: args.productStatus,
          editor: args.Email,
          dateUpdated: date
        }
      })
      return {
        "statusText": "Successfuly Save!",
        "jsonToken": "String"
      }
    },
    saveCropImage: async (parent: any, args: any) => {
      const id = parseInt(args.id);
      const file = args.file;

      const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      // Create a buffer from the base64 data
      const buffer: any = Buffer.from(base64Data, 'base64');



      const date = new Date();
      const YYYY = date.getFullYear();
      const MM = date.getMonth();
      const DD = date.getDay();
      const hh = date.getHours();
      const mm = date.getMinutes();
      const ss = date.getSeconds();
      // console.log(typeof id)
      const newName = `Product-${YYYY + "-" + MM + "-" + DD + "-" + hh + "-" + mm + -"" + ss + ".webp"}`;

      const uploadRes = await uploadFileToAmazons3(newName, buffer);

      await prisma.childInventory.update({
        where: {
          id: id
        },
        data: {
          thumbnail: newName
        }
      })

      const result = await prisma.inv_subImage.create({
        data: {
          ImagePath: newName,
          subImageRelationChild: id
        }
      })
      console.log('Image saved successfully:', newName);

    },
    postMessage: async (parent: any, args: any) => {
      try {
        const newMessage = await prisma.crowdMessages.create({
          data: {
            Messages: args.Message,
            Sender: args.Sender
          }
        });

        pubsub.publish(MESSAGE_ADDED, { messageAdded: newMessage });
        return newMessage;
      } catch (error: any) {
        console.error("Error creating message:", error);
      }
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
};

