const admin = require("firebase-admin");

const collectionName = process.env.FIRESTORE_COLLECTION || "donations";
let firestore = null;
const memoryStore = [];

(function initFirebase() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    firestore = admin.firestore();
    console.log("Firestore initialized.");
  } catch {
    firestore = null;
    console.log("Firestore unavailable. Using in-memory demo store.");
  }
})();

async function saveDonation(donation) {
  if (firestore) {
    await firestore.collection(collectionName).doc(donation.id).set(donation);
    return donation;
  }
  memoryStore.push(donation);
  return donation;
}

async function listDonations() {
  if (firestore) {
    const snap = await firestore.collection(collectionName).orderBy("createdAt", "desc").limit(200).get();
    return snap.docs.map((d) => d.data());
  }
  return [...memoryStore];
}

module.exports = { saveDonation, listDonations };