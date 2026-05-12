import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";

export const saveUserRole = async (userId, role) => {
  localStorage.setItem(`userRole_${userId}`, role);
  
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { userRole: role }, { merge: true });
};

export const getUserRole = (userId) => {
  return localStorage.getItem(`userRole_${userId}`) || 'worker';
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    // Fallback if document doesn't exist yet but user is authenticated
    return {
      name: auth.currentUser?.displayName || "New User",
      email: auth.currentUser?.email,
      bio: "Welcome to JobLink!",
      photoURL: auth.currentUser?.photoURL || null
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, profileData);
  // Optional: Update localStorage if you still want to cache it
  localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profileData));
};

export const logoutUser = async () => {
  await signOut(auth);
  // Clear any local caches if necessary
  // localStorage.clear(); // Use with caution
};
