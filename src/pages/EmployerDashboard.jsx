import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Briefcase, MapPin, Banknote, Clock, Users, User, SwitchCamera, LogOut, Loader2, CheckCircle2, Star, AlertCircle, Send, X, ShieldAlert } from "lucide-react";
import { formatNaira } from "../utils/formatNaira";
import { getUserRole, getUserProfile, logoutUser } from "../services/userService";
import { subscribeToEmployerJobs, postJob, subscribeToEmployerApplications, updateApplicationStatus, submitRating, submitComplaint } from "../services/jobService";
import { auth } from "../firebase";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const role = getUserRole(user?.uid);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("postings"); // "postings" or "applicants"
  const [isLoading, setIsLoading] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null); // { appId, workerId }
  const [reportTarget, setReportTarget] = useState(null); // { workerId, name }
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    const fetchProfile = async () => {
      const data = await getUserProfile(user.uid);
      setProfile(data);
    };
    fetchProfile();

    const unsubscribeJobs = subscribeToEmployerJobs(user.uid, (jobsData) => {
      setJobs(jobsData);
    });

    const unsubscribeApps = subscribeToEmployerApplications(user.uid, (appsData) => {
      console.log('Fetched Applications:', appsData);
      setApplications(appsData);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [user, navigate]);

  const [isPosting, setIsPosting] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", description: "", pay: "", rateType: "/hr", time: "", location: "" });

  const handlePayChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setNewJob({ ...newJob, pay: "" });
      return;
    }
    setNewJob({ ...newJob, pay: formatNaira(Number(rawValue)) });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.pay) return;
    
    setIsLoading(true);
    try {
      await postJob({
        ...newJob,
        employerName: profile?.name || "Employer"
      }, user.uid);
      
      setNewJob({ title: "", description: "", pay: "", rateType: "/hr", time: "", location: "" });
      setIsPosting(false);
    } catch (error) {
      console.error("Error posting job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    if (!appId) {
      alert("Error: Application ID is missing. Cannot update.");
      console.error("Missing appId for status update");
      return;
    }
    try {
      console.log(`Updating app ${appId} to ${status}`);
      await updateApplicationStatus(appId, status);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleRateWorker = async (rating) => {
    if (!ratingTarget) return;
    try {
      await submitRating(ratingTarget.workerId, user.uid, rating, ratingTarget.appId);
      setRatingTarget(null);
    } catch (error) {
      console.error("Rating failed:", error);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportTarget || !reportReason) return;
    try {
      await submitReport(user.uid, reportTarget.workerId, reportReason);
      setReportTarget(null);
      setReportReason("");
    } catch (error) {
      console.error("Report failed:", error);
    }
  };

  const handleComplaint = async (reason) => {
    if (!reportTarget) return;
    try {
      await submitComplaint(user.uid, reportTarget.workerId, reason);
      setReportTarget(null);
    } catch (error) {
      console.error("Complaint failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white sticky top-0 z-20 shadow-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 justify-center items-center flex rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/10 shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Employer Dashboard</h1>
                <p className="text-indigo-200 text-sm font-medium">Manage your job postings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(profile?.userRole === 'worker' || profile?.userRole === 'both') && (
                <Link to="/worker/feed" className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/10 backdrop-blur-sm transition-colors">
                  <SwitchCamera className="w-4 h-4" /> Worker View
                </Link>
              )}
              <Link to="/profile" className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold border-2 border-slate-700 shadow-lg transition-colors overflow-hidden">
                {profile?.photoURL ? (
                   <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-8 mt-6">
            <button 
              onClick={() => setActiveTab("postings")}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "postings" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              My Postings
              {activeTab === "postings" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab("applicants")}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "applicants" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              Manage Applicants
              {activeTab === "applicants" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 rounded-full" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "postings" ? (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">Your Active Listings</h2>
              <button 
                onClick={() => setIsPosting(!isPosting)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
              >
                {isPosting ? "Cancel" : <><Plus className="w-5 h-5" /> Post New Job</>}
              </button>
            </div>

            {/* Post Form */}
            {isPosting && (
              <form onSubmit={handlePostJob} className="bg-white rounded-[24px] p-8 shadow-xl shadow-emerald-900/5 border border-emerald-100 mb-8 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-800 mb-6 ml-2">Create New Posting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Job Title</label>
                    <input 
                      required
                      type="text" 
                      value={newJob.title}
                      onChange={e => setNewJob({...newJob, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="e.g. House Cleaning"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Description</label>
                    <textarea 
                      required
                      value={newJob.description}
                      onChange={e => setNewJob({...newJob, description: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] transition-all font-medium"
                      placeholder="Provide context and requirements..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Compensation</label>
                    <div className="flex gap-2">
                      <input 
                        required
                        type="text" 
                        value={newJob.pay}
                        onChange={handlePayChange}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                        placeholder="e.g. 15,000"
                      />
                      <select 
                        value={newJob.rateType}
                        onChange={e => setNewJob({...newJob, rateType: e.target.value})}
                        className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium cursor-pointer"
                      >
                        <option value="/hr">/ hour</option>
                        <option value=" flat">flat</option>
                        <option value="/day">/ day</option>
                        <option value="/week">/ week</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Location</label>
                    <input 
                      required
                      type="text" 
                      value={newJob.location}
                      onChange={e => setNewJob({...newJob, location: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="e.g. Yaba, Lagos"
                    />
                  </div>
                </div>
                <div className="mt-8 ml-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPosting(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                    ) : (
                      "Publish Posting"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Listings List */}
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-lg">You haven't posted any jobs yet.</p>
                  <button 
                    onClick={() => setIsPosting(true)}
                    className="mt-4 text-emerald-600 font-bold hover:text-emerald-500 transition-colors"
                  >
                    Create your first posting
                  </button>
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-md hover:border-emerald-200 transition-all group">
                    <div className="flex-1">
                      <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3 text-sm font-medium text-slate-600">
                        <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-emerald-500" /> {job.pay}<span className="text-slate-400 font-normal">{job.rateType}</span></span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" /> {job.location}</span>
                        {job.time && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> {job.time}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {applications.filter(app => app.jobId === job.id).length} Applicants
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Job Applicants</h2>
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">No applications received yet.</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                      {app.applicantPhoto ? (
                        <img src={app.applicantPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{app.applicantName || "Anonymous Worker"}</h3>
                      <p className="text-sm text-slate-500 font-medium">Applied for: <span className="text-indigo-600">{app.jobTitle || "Job Listing"}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 w-full sm:w-auto">
                    {app.status === 'accepted' ? (
                      <div className="flex flex-col gap-3">
                        <div className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 border border-emerald-200 shadow-sm">
                          <CheckCircle2 className="w-5 h-5" />
                          Job Accepted
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 text-center">Rate Worker</p>
                          <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star}
                                onClick={() => submitRating(app.applicantId, user.uid, star, app.id)}
                                className="p-1 text-slate-200 hover:text-amber-500 transition-colors"
                              >
                                <Star className="w-6 h-6 hover:fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          className="flex-1 sm:flex-none px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'declined')}
                          className="px-6 py-3 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl font-bold transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setReportTarget({ workerId: app.applicantId, name: app.applicantName })}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold border border-red-100 transition-all active:scale-95"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      Report Issue
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Complaint Options Modal */}
      {reportTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Report Issue</h3>
              <button onClick={() => setReportTarget(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400"><X /></button>
            </div>
            <p className="text-slate-500 mb-8">What happened with <span className="font-bold text-slate-900">{reportTarget.name}</span>?</p>
            
            <div className="space-y-3">
              {['Worker didn\'t show up', 'Payment issue', 'Unprofessional behavior', 'Incomplete work'].map((reason) => (
                <button 
                  key={reason}
                  onClick={() => handleComplaint(reason)}
                  className="w-full p-4 text-left bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-2xl font-bold text-slate-700 hover:text-red-700 transition-all flex justify-between items-center group"
                >
                  {reason}
                  <Send className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setReportTarget(null)}
              className="w-full mt-6 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
