import { S3Client } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
config()
const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.APP_AWS_SECRET_KEY || ""
  }
});
  
export default s3Client
