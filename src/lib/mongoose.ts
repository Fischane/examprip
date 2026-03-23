import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/examprep'

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (global._mongoose.conn) return global._mongoose.conn

  if (!global._mongoose.promise) {
    global._mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }

  global._mongoose.conn = await global._mongoose.promise
  return global._mongoose.conn
}
