/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { companies } from '../lib/data';
import { segments } from '../lib/data';
import { cmmsRoles } from '../lib/data';
import { customerLocations } from '../lib/data';
import { users } from '../lib/data';
import { assets } from '../lib/data';
import { contracts } from '../lib/data';
import { products } from '../lib/data';
import { suppliers } from '../lib/data';
import { workOrders } from '../lib/data';
import { costCenters } from '../lib/data';
import { chartOfAccounts } from '../lib/data';
import { accountsPayable } from '../lib/data';
import { accountsReceivable } from '../lib/data';
import { bankAccounts } from '../lib/data';
import { checklistTemplates } from '../lib/data';
import { schedules } from '../lib/data';

// IMPORTANT: Path to your Firebase service account key file.
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = getFirestore();
const auth = getAuth();

async function seedCollection<T extends { id: string }>(collectionName: string, data: T[]) {
  console.log(`Seeding ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  const batch = db.batch();

  // Delete existing documents
  const snapshot = await collectionRef.get();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Add new documents
  const newBatch = db.batch();
  data.forEach((item) => {
    const { id, ...rest } = item;
    const docRef = collectionRef.doc(id);
    newBatch.set(docRef, rest);
  });

  await newBatch.commit();
  console.log(`${collectionName} seeded successfully with ${data.length} documents.`);
}

async function seedUsers() {
    console.log('Seeding users and Firebase Auth...');
    const authUsers = await auth.listUsers();
    
    // Delete existing Firebase Auth users
    const uidsToDelete = authUsers.users.map(u => u.uid);
    if (uidsToDelete.length > 0) {
        await auth.deleteUsers(uidsToDelete);
        console.log(`Deleted ${uidsToDelete.length} Firebase Auth users.`);
    }

    // Delete existing user documents in Firestore
    const usersCollectionRef = db.collection('users');
    const snapshot = await usersCollectionRef.get();
    if(!snapshot.empty) {
        const deleteBatch = db.batch();
        snapshot.docs.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
    }

    // Create new users
    const userPromises = users.map(async (user) => {
        try {
            const { id, password, ...userData } = user;
            const userRecord = await auth.createUser({
                uid: id,
                email: user.email,
                password: password || 'password', // Default password if not provided
                displayName: user.name,
                photoURL: user.avatarUrl,
                emailVerified: true,
                disabled: false,
            });
            console.log(`Successfully created new auth user: ${userRecord.uid}`);
            
            const userDocRef = usersCollectionRef.doc(userRecord.uid);
            // Don't save password to Firestore
            const { password: userPassword, ...restOfUserData } = user;
            await userDocRef.set(restOfUserData);

        } catch (error) {
            console.error(`Error creating user ${user.email}:`, error);
        }
    });

    await Promise.all(userPromises);
    console.log(`Users collection seeded and Firebase Auth users created.`);
}


async function main() {
  try {
    await seedCollection('companies', companies);
    await seedCollection('segments', segments);
    await seedCollection('cmmsRoles', cmmsRoles);
    await seedCollection('customerLocations', customerLocations);
    await seedCollection('assets', assets);
    await seedCollection('contracts', contracts);
    await seedCollection('products', products);
    await seedCollection('suppliers', suppliers);
    await seedCollection('workOrders', workOrders);
    await seedCollection('costCenters', costCenters);
    await seedCollection('chartOfAccounts', chartOfAccounts);
    await seedCollection('accountsPayable', accountsPayable);
    await seedCollection('accountsReceivable', accountsReceivable);
    await seedCollection('bankAccounts', bankAccounts);
    await seedCollection('checklistTemplates', checklistTemplates);
    await seedCollection('schedules', schedules);
    await seedUsers();
    
    console.log('\nDatabase has been seeded successfully! ✅');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

main();
