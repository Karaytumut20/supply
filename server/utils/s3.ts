import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const getS3Client = () => {
    return new S3Client({
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT, // Optional: e.g. for Cloudflare R2
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || '',
            secretAccessKey: process.env.S3_SECRET_KEY || ''
        }
    })
}

export const getS3Bucket = () => process.env.S3_BUCKET || 'inspo-bucket'

export const uploadToS3 = async (key: string, body: Buffer, contentType: string) => {
    const client = getS3Client()
    const command = new PutObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
        Body: body,
        ContentType: contentType
    })
    return client.send(command)
}

export const generatePresignedUrl = async (key: string, expiresInSeconds: number = 900, downloadName?: string) => {
    const client = getS3Client()
    const filename = downloadName || key.split('/').pop()
    const command = new GetObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
        ResponseContentDisposition: `attachment; filename="${filename}"`
    })
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

export const deleteS3Object = async (key: string) => {
    const client = getS3Client()
    const command = new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: key
    })
    return client.send(command)
}
