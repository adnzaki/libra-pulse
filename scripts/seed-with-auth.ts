import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import fs from 'fs';
import path from 'path';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log('Authenticating anonymously...');
  try {
    const userCred = await signInAnonymously(auth);
    console.log('Signed in as anonymous user:', userCred.user.uid);
  } catch (err: any) {
    console.warn('Anonymous sign-in not enabled or failed, continuing without auth:', err.message);
  }

  const dataPath = path.join(process.cwd(), 'library-data.json');
  let data: any = {};
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  const categories = data.categories || [];
  const shelves = data.shelves || [];
  const books = data.books || [];
  const members = data.members || [];

  console.log(`Writing ${categories.length} categories...`);
  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), cat);
    console.log('✓ Category', cat.id);
  }

  console.log(`Writing ${shelves.length} shelves...`);
  for (const s of shelves) {
    await setDoc(doc(db, 'shelves', s.id), s);
    console.log('✓ Shelf', s.id);
  }

  console.log(`Writing ${books.length} books...`);
  for (const b of books) {
    await setDoc(doc(db, 'books', b.id), b);
    console.log('✓ Book', b.id);
  }

  console.log(`Writing ${members.length} members...`);
  for (const m of members) {
    await setDoc(doc(db, 'members', m.id), m);
    console.log('✓ Member', m.id);
  }

  console.log('✅ Success!');
}

seed().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
