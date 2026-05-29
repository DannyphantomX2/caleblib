const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'image/jpeg',
  'image/png',
  'text/plain',
  'video/mp4'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const getBucket = () => {
  const db = mongoose.connection.db;
  return new GridFSBucket(db, { bucketName: 'resources' });
};

const uploadFile = (fileBuffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return reject(new Error(`File type ${mimeType} is not allowed`));
    }
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return reject(new Error('File size exceeds 50MB limit'));
    }

    const bucket = getBucket();
    const ext = path.extname(originalName);
    const uniqueName = `${uuidv4()}${ext}`;

    const uploadStream = bucket.openUploadStream(uniqueName, {
      metadata: { originalName, mimeType, uploadedAt: new Date() }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id,
        fileName: uniqueName,
        originalName,
        fileSize: fileBuffer.length,
        fileFormat: ext.replace('.', '').toLowerCase()
      });
    });

    uploadStream.end(fileBuffer);
  });
};

const downloadFile = (fileId) => {
  const bucket = getBucket();
  const _id = new mongoose.Types.ObjectId(fileId);
  return bucket.openDownloadStream(_id);
};

const deleteFile = async (fileId) => {
  const bucket = getBucket();
  const _id = new mongoose.Types.ObjectId(fileId);
  await bucket.delete(_id);
};

const getFileInfo = async (fileId) => {
  const bucket = getBucket();
  const _id = new mongoose.Types.ObjectId(fileId);
  const files = await bucket.find({ _id }).toArray();
  return files[0] || null;
};

module.exports = { uploadFile, downloadFile, deleteFile, getFileInfo };
