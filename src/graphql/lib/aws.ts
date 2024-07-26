import s3Client from './S3Client.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable, Stream } from 'stream'

export const uploadFileToAmazons3 = async (filename: string, stream: Stream) => {
    try {
        const pathName = `images/Legit/${filename}`;
        // streamToBuffer(stream).then(async (buffer) => {
            const params:any = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: pathName,
                Body: stream
            }

            const results = await s3Client.send(new PutObjectCommand(params));
            return results;
        // })
    } catch (error) {
        console.log("Error: ", error)
    }
}



const streamToBuffer = async (stream: Stream): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
        const _buf: any[] = [];
        stream.on('data', (chunk) => _buf.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(_buf)));
        stream.on('error', (err) => reject(err));
    });
}
