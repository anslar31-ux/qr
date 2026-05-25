import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateWebRTC, getConnectionHandlerSimplePeer } from 'rxdb/plugins/replication-webrtc';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

// Add plugins
addRxPlugin(RxDBUpdatePlugin);

// Schemas
const userSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    role: { type: 'string' }
  },
  required: ['id', 'name', 'email', 'password', 'role']
};

const tableSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    label: { type: 'string' },
    qrCodeUrl: { type: 'string' }
  },
  required: ['id', 'label', 'qrCodeUrl']
};

const categorySchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    order: { type: 'number' }
  },
  required: ['id', 'name', 'order']
};

const menuItemSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    categoryId: { type: 'string' },
    price: { type: 'number' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    available: { type: 'boolean' },
    customizationOptions: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['id', 'name', 'categoryId', 'price', 'description', 'imageUrl', 'available']
};

const orderSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    tableId: { type: 'string' },
    customerId: { type: 'string' },
    customerName: { type: 'string' },
    customerEmail: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cartId: { type: 'number' },
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number' },
          customizations: { type: 'array', items: { type: 'string' } },
          specialInstructions: { type: 'string' }
        }
      }
    },
    totalAmount: { type: 'number' },
    status: { type: 'string' },
    paymentStatus: { type: 'string' },
    createdAt: { type: 'string' }
  },
  required: ['id', 'tableId', 'items', 'status', 'paymentStatus']
};

const waiterCallSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    tableId: { type: 'string' },
    orderId: { type: 'string' },
    timestamp: { type: 'string' }
  },
  required: ['id', 'tableId', 'timestamp']
};

let dbPromise = null;

export const initRxDB = async () => {
  if (dbPromise) return dbPromise;
  
  dbPromise = (async () => {
    const db = await createRxDatabase({
      name: 'qrcafedb',
      storage: getRxStorageDexie(),
      multiInstance: true,
      eventReduce: true,
      ignoreDuplicate: true
    });

    await db.addCollections({
      users: { schema: userSchema },
      tables: { schema: tableSchema },
      categories: { schema: categorySchema },
      menuItems: { schema: menuItemSchema },
      orders: { schema: orderSchema },
      waitercalls: { schema: waiterCallSchema }
    });

    // Set up WebRTC replication for collections that need cross-device sync
    // In a real app, you would only sync relevant data to relevant clients for security.
    // Here we sync orders and waiter calls globally.
    const collectionsToSync = [db.orders, db.waitercalls];
    
    // We use a public signaling server for demonstration.
    // In production, host your own socket.io signaling server.
    const signalingServerUrl = 'wss://signaling.rxdb.info/';
    const roomName = 'qr-cafe-sync-room-12345'; // unique room

    collectionsToSync.forEach(collection => {
      replicateWebRTC({
        collection,
        topic: `${roomName}-${collection.name}`,
        connectionHandlerCreator: getConnectionHandlerSimplePeer({
          signalingServerUrl
        }),
        pull: {},
        push: {}
      });
    });

    return db;
  })();

  return dbPromise;
};
