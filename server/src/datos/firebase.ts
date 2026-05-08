import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' }

initializeApp({
  credential: cert(serviceAccount as unknown as { projectId: string; clientEmail: string; privateKey: string }),
})

export const db = getFirestore()
