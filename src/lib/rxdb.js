import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateWebRTC, getConnectionHandlerSimplePeer } from 'rxdb/plugins/replication-webrtc';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

addRxPlugin(RxDBUpdatePlugin);

// ─── Schemas ────────────────────────────────────────────────────────────────

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
          specialInstructions: { type: 'string' },
        },
      },
    },
    totalAmount: { type: 'number' },
    status: { type: 'string' },
    paymentStatus: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'tableId', 'items', 'status', 'paymentStatus'],
};

const waiterCallSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    tableId: { type: 'string' },
    orderId: { type: 'string' },
    timestamp: { type: 'string' },
  },
  required: ['id', 'tableId', 'timestamp'],
};

// ─── Singleton ───────────────────────────────────────────────────────────────

let dbPromise = null;

export const initRxDB = async () => {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const db = await createRxDatabase({
      name: 'qrcafe_orders_v1',
      storage: getRxStorageDexie(),
      multiInstance: true,
      eventReduce: true,
      ignoreDuplicate: true,
    });

    await db.addCollections({
      orders: { schema: orderSchema },
      waitercalls: { schema: waiterCallSchema },
    });

    // WebRTC P2P sync — orders and waiter calls only
    // Devices must be open simultaneously for WebRTC to sync.
    // Use public signaling server for demonstration.
    const signalingServerUrl = 'wss://signaling.rxdb.info/';
    const roomName = 'anslar-qr-cafe-v1-prod'; // unique room

    try {
      [db.orders, db.waitercalls].forEach((collection) => {
        replicateWebRTC({
          collection,
          topic: `${roomName}-${collection.name}`,
          connectionHandlerCreator: getConnectionHandlerSimplePeer({
            signalingServerUrl,
          }),
          pull: {},
          push: {},
        });
      });
    } catch (err) {
      console.warn("WebRTC Sync Error:", err);
    }

    return db;
  })();

  return dbPromise;
};
