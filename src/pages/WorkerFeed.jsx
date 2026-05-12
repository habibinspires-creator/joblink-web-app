import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Banknote, Search, CheckCircle2, User, SwitchCamera, LogOut, AlertCircle, Send, X, ShieldAlert, Star } from "lucide-react";
import { auth } from "../firebase";
import { getUserRole, getUserProfile, logoutUser } from "../services/userService";
import { subscribeToJobs, applyForJob, subscribeToUserApplications, submitComplaint, submitRating } from "../services/jobService";

export default function WorkerFeed() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const user = auth.currentUser;
  const role = getUserRole(user?.uid);
  const [profile, setProfile] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("find"); // "find" or "applications"
  const [isApplying, setIsApplying] = useState(false);
  const [hasAppliedLocally, setHasAppliedLocally] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { id, name, type }
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

    const unsubscribeJobs = subscribeToJobs((jobsData) => {
      setJobs(jobsData);
    });

    const unsubscribeApps = subscribeToUserApplications(user.uid, (appsData) => {
      setUserApplications(appsData);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [user, navigate]);

  // Derived state: has the user applied to the currently selected job?
  const alreadyApplied = userApplications.some(app => app.jobId === selectedJob?.id) || hasAppliedLocally;

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleComplaint = async (reason) => {
    if (!reportTarget) return;
    try {
      await submitComplaint(user.uid, reportTarget.id, reason);
      setReportTarget(null);
    } catch (error) {
      console.error("Complaint failed:", error);
    }
  };

  const acceptJob = async (jobId, employerId) => {
    if (!user) return;
    
    // REQUIREMENT: Explicitly check for employerId and alert if missing
    if (employerId === null || employerId === undefined) {
      alert("Error: The employerId for this job is missing. Cannot apply.");
      return;
    }

    setIsApplying(true);
    
    try {
      // REQUIREMENT: Use addDoc (handled inside applyForJob) with jobId, employerId, applicantId
      // We also include applicantName and jobTitle for display in the Employer Dashboard
      await applyForJob(jobId, user.uid, employerId, {
        applicantName: profile?.name || "Anonymous Worker",
        jobTitle: selectedJob.title
      });
      
      // REQUIREMENT: Show 'Success' alert immediately
      alert("Success! Your application has been sent.");
      
      // REQUIREMENT: Change button state to 'Applied'
      setHasAppliedLocally(true);
      console.log('Application sent successfully to applications collection');
      
      // Success delay before closing modal
      setTimeout(() => {
        setHasAppliedLocally(false);
        setSelectedJob(null);
      }, 2000);
    } catch (error) {
      console.error("Application failed:", error);
      alert("There was an issue sending your application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">Local Jobs</h1>
            </div>
            <div className="flex items-center gap-3">
              {(profile?.userRole === 'employer' || profile?.userRole === 'both') && (
                <Link to="/employer/dashboard" className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold border border-purple-100 hover:bg-purple-100 transition-colors">
                  <SwitchCamera className="w-4 h-4" /> Employer View
                </Link>
              )}
              <Link to="/profile" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold border-2 border-white shadow-sm transition-colors overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-6 mb-6 border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("find")}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "find" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Find Jobs
              {activeTab === "find" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab("applications")}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "applications" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              My Applications
              {activeTab === "applications" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
            </button>
          </div>

          {activeTab === "find" && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          )}
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        
        {activeTab === "find" ? (
          filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {search ? "No jobs match your search" : "No jobs available yet"}
              </h3>
              <p className="text-slate-500">
                {search ? "Try adjusting your search terms" : "Check back later or post a new job yourself!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        {job.employerName || "Employer"} <span className="w-1 h-1 bg-slate-300 rounded-full" /> {job.postedAt || "Recent"}
                      </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-extrabold flex items-center gap-1 shadow-sm border border-emerald-100">
                      <Banknote className="w-4 h-4" />
                      {job.pay}<span className="text-emerald-600/70 text-xs font-semibold">{job.rateType}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 text-orange-500" />
                      {job.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Your Applications</h2>
            {userApplications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">You haven't applied to any jobs yet.</p>
              </div>
            ) : (
              userApplications.map(app => (
                <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{app.jobTitle || `Job ID: ${app.jobId}`}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-medium">Status:</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                          app.status === 'declined' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      
                      {app.status === 'accepted' && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Rate Employer</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star}
                                onClick={() => submitRating(app.employerId, user.uid, star, app.id)}
                                className="p-1 text-slate-200 hover:text-amber-500 transition-colors"
                              >
                                <Star className="w-5 h-5 hover:fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                        {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : "Just now"}
                      </div>
                      <button 
                        onClick={() => setReportTarget({ id: app.employerId, name: "Employer", type: "employer" })}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Report Employer"
                      >
                        <ShieldAlert className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Expanded Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative animate-slide-up">
            <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-800 p-6 flex items-start justify-between">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">{selectedJob.title}</h2>
                <p className="text-blue-100 font-medium">{selectedJob.employer}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedJob(null);
                  setHasAppliedLocally(false);
                }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-md"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Compensation</p>
                    <p className="font-bold text-slate-900">{selectedJob.pay}<span className="text-sm font-normal text-slate-500">{selectedJob.rateType}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Location</p>
                    <p className="font-bold text-slate-900">{selectedJob.location}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedJob.description}
                </p>
              </div>
              
              {selectedJob.requirements && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements.map((req, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {(alreadyApplied || hasAppliedLocally) && (
                  <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold border border-emerald-100 mb-2 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5" />
                    {hasAppliedLocally ? "Success! Your application has been sent." : "You have already applied for this job."}
                  </div>
                )}
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => acceptJob(selectedJob.id, selectedJob.employerId)}
                      disabled={alreadyApplied || isApplying}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                        alreadyApplied 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {isApplying ? "Sending..." : (alreadyApplied ? "Applied" : "Accept Job")}
                    </button>
                    <button 
                      onClick={() => setReportTarget({ id: selectedJob.employerId, name: selectedJob.employerName || "Employer", type: "employer" })}
                      className="px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold border border-red-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <ShieldAlert className="w-6 h-6" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {['Employer didn\'t pay', 'Unsafe environment', 'Unprofessional behavior', 'Job details were false'].map((reason) => (
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
