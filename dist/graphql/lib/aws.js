import s3Client from './S3Client.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
export const uploadFileToAmazons3 = async (filename, stream) => {
    try {
        const pathName = `images/Legit/${filename}`;
        // streamToBuffer(stream).then(async (buffer) => {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: pathName,
            Body: stream
        };
        const results = await s3Client.send(new PutObjectCommand(params));
        return results;
        // })
    }
    catch (error) {
        console.log("Error: ", error);
    }
};
const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const _buf = [];
        stream.on('data', (chunk) => _buf.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(_buf)));
        stream.on('error', (err) => reject(err));
    });
};
