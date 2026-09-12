#!/usr/bin/env node
/* Step 1 of the data migration: dump the live Firestore project to JSON.
 *
 *   npm i -D firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run import:firestore
 *
 * Get service-account.json from the Firebase console:
 *   Project settings -> Service accounts -> Generate new private key.
 * It is a real credential: keep it out of git and delete it when you are done.
 */
import { writeFileSync } from 'node:fs'

let admin
try {
  admin = await import('firebase-admin/app')
} catch {
  console.error('firebase-admin is not installed. Run:  npm i -D firebase-admin')
  process.exit(1)
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.')
  process.exit(1)
}

const { getFirestore } = await import('firebase-admin/firestore')
admin.initializeApp({ credential: admin.applicationDefault() })
const db = getFirestore()

const dump = async (name) => {
  const snap = await db.collection(name).get()
  console.log(`  ${name}: ${snap.size} documents`)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

console.log('Reading Firestore...')
const data = {
  users: await dump('users'),
  posts: await dump('posts'),
  userActions: await dump('userActions'),
  sponsoredRewards: await dump('sponsoredRewards'),
  comments: [],
}

// Comments live in a subcollection under each post.
for (const post of data.posts) {
  const snap = await db.collection('posts').doc(post.id).collection('comments').get()
  for (const doc of snap.docs) data.comments.push({ id: doc.id, postId: post.id, ...doc.data() })
}
console.log(`  comments: ${data.comments.length} documents`)

writeFileSync('scripts/firestore-dump.json', JSON.stringify(data, null, 2))
console.log('\nWrote scripts/firestore-dump.json')
console.log('Next:  npm run import:d1 -- --local     (then --remote when it looks right)')
