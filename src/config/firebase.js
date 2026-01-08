import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

// Initialize Firebase Admin SDK only if needed (Google OAuth)
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin SDK initialized (for Google OAuth only)");
  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization failed:", error);
  }
}

// Safely access services
let auth, db;
try {
  if (admin.apps.length > 0) {
    auth = admin.auth();
    db = admin.firestore();
  } else {
    console.warn("⚠️ Firebase services not available: App not initialized");
    // Mock or null values for non-blocking behavior
    auth = { verifyIdToken: () => { throw new Error("Firebase not configured"); } };
    db = null;
  }
} catch (error) {
  console.error("❌ Error accessing Firebase services:", error);
}

export { auth, db };
export default admin;
