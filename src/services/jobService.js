import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, doc, collectionGroup, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const JOBS_COLLECTION = "jobs";
const APPLICATIONS_COLLECTION = "applications";

/**
 * Subscribe to real-time updates for all jobs
 * @param {Function} callback - Function to handle the jobs data
 * @returns {Unsubscribe} - Function to unsubscribe from the listener
 */
export const subscribeToJobs = (callback) => {
  const jobsRef = collection(db, JOBS_COLLECTION);
  // Using query with filter and orderBy which requires a Composite Index
  const q = query(
    jobsRef, 
    where("status", "==", "open"),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const jobsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(jobsData);
  }, (error) => {
    console.error("Error subscribing to jobs:", error);
  });
};

/**
 * Subscribe to real-time updates for jobs posted by a specific employer
 * @param {string} employerId - The ID of the employer
 * @param {Function} callback - Function to handle the jobs data
 */
export const subscribeToEmployerJobs = (employerId, callback) => {
  const jobsRef = collection(db, JOBS_COLLECTION);
  const q = query(
    jobsRef, 
    where("employerId", "==", employerId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const jobsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(jobsData);
  }, (error) => {
    console.error("Error subscribing to employer jobs:", error);
  });
};

/**
 * Post a new job listing
 * @param {Object} jobData - The job details
 * @param {string} employerId - The ID of the employer posting the job
 * @returns {Promise<String>} - The ID of the created document
 */
export const postJob = async (jobData, employerId) => {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const docRef = await addDoc(jobsRef, {
      ...jobData,
      employerId,
      applicants: 0,
      createdAt: serverTimestamp(),
      status: "open"
    });
    return docRef.id;
  } catch (error) {
    console.error("Error posting job:", error);
    throw error;
  }
};

/**
 * Apply for a job
 * @param {string} jobId - The ID of the job
 * @param {string} applicantId - The ID of the worker applying
 * @param {string} employerId - The ID of the job owner
 * @param {Object} extraData - Additional info (applicantName, jobTitle)
 */
export const applyForJob = async (jobId, applicantId, employerId, extraData = {}) => {
  try {
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    await addDoc(appsRef, {
      jobId,
      applicantId,
      employerId,
      appliedAt: new Date(),
      status: "pending",
      ...extraData
    });
    console.log('Application sent successfully');
  } catch (error) {
    console.error("Error applying for job:", error);
    throw error;
  }
};

/**
 * Subscribe to all applications for an employer's jobs
 * @param {string} employerId - The ID of the employer
 * @param {Function} callback - Callback for application data
 */
export const subscribeToEmployerApplications = (employerId, callback) => {
  console.log('Searching for Employer UID:', employerId);
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  const appsQuery = query(
    appsRef,
    where("employerId", "==", employerId)
  );

  return onSnapshot(appsQuery, (snapshot) => {
    const appsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(appsData);
  }, (error) => {
    console.error("Error subscribing to applications:", error);
  });
};

/**
 * Subscribe to all applications made by a specific worker
 * @param {string} applicantId - The ID of the worker
 * @param {Function} callback - Callback for application data
 */
export const subscribeToUserApplications = (applicantId, callback) => {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  const appsQuery = query(
    appsRef,
    where("applicantId", "==", applicantId)
  );

  return onSnapshot(appsQuery, (snapshot) => {
    const appsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(appsData);
  }, (error) => {
    console.error("Error subscribing to user applications:", error);
  });
};

/**
 * Update the status of an application
 * @param {string} applicationId - The ID of the application document
 * @param {string} status - The new status ('accepted', 'declined', etc)
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(appRef, { status });
    alert('Update Successful');
    console.log(`Application ${applicationId} status updated to ${status}`);
  } catch (error) {
    alert(`Update Failed: ${error.message}`);
    console.error("Error updating application status:", error);
    throw error;
  }
};

/**
 * Submit a rating for a worker
 */
export const submitRating = async (workerId, employerId, rating, applicationId) => {
  try {
    const ratingsRef = collection(db, "ratings");
    await addDoc(ratingsRef, {
      workerId,
      employerId,
      rating,
      applicationId,
      timestamp: serverTimestamp()
    });
    alert('Rating Submitted');
  } catch (error) {
    alert(`Rating Failed: ${error.message}`);
    throw error;
  }
};

/**
 * Submit a complaint
 */
export const submitComplaint = async (reporterId, reportedId, reason) => {
  try {
    const complaintsRef = collection(db, "complaints");
    await addDoc(complaintsRef, {
      reporterId,
      reportedId,
      reason,
      timestamp: serverTimestamp()
    });
    alert('Complaint Filed Successfully');
  } catch (error) {
    alert(`Complaint Failed: ${error.message}`);
    throw error;
  }
};
