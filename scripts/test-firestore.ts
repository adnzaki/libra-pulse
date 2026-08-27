import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  console.log('Testing test/connection write...');
  await setDoc(doc(db, 'test', 'connection'), { timestamp: Date.now(), status: 'ok' });
  console.log('Write success!');
  const snap = await getDoc(doc(db, 'test', 'connection'));
  console.log('Read success! Data:', snap.data());
}

test().catch(err => {
  console.error('Test error:', err);
});
