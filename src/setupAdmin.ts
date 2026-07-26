import { db } from './firebase'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'

export async function setupAdminUser(email: string) {
  const targetEmail = email.toLowerCase().trim()
  
  const q = query(collection(db, 'users'), where('email', '==', targetEmail))
  const snap = await getDocs(q)
  
  if (snap.empty) {
    console.log(`User with email ${targetEmail} not found. They need to sign in to the app first.`)
    return false
  }
  
  const userDoc = snap.docs[0]
  await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true })
  console.log(`✓ ${targetEmail} is now an admin`)
  return true
}

setupAdminUser('aarush.uae@gmail.com')
  .then(success => {
    if (success) {
      console.log('Admin setup complete. aarush.uae@gmail.com can now access the admin panel.')
    }
  })
  .catch(err => console.error('Error:', err))
