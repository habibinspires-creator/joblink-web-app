import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Edit2, Save, X, Briefcase, Camera, Trash2, LogOut } from "lucide-react";
import { getUserProfile, updateUserProfile, getUserRole, logoutUser } from "../services/userService";
import { auth } from "../firebase";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    bio: "",
    skill: "",
    photoURL: null
  });
  
  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    const fetchProfile = async () => {
      const data = await getUserProfile(user.uid);
      if (data) {
        setProfile(data);
        setEditForm(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, photoURL: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEditForm({ ...editForm, photoURL: null });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    await updateUserProfile(user.uid, editForm);
    setProfile(editForm);
    setIsEditing(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const role = getUserRole(user?.uid);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
          </div>
          {role === 'both' && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
              Dual Profile
            </span>
          )}
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors ml-2"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white p-1 absolute -top-12 border-4 border-slate-50 group">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden relative">
                {isEditing ? (
                  editForm.photoURL ? (
                    <img src={editForm.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )
                ) : (
                  profile.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )
                )}
                
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              
              {isEditing && editForm.photoURL && (
                <button 
                  onClick={handleRemoveImage}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex justify-end pt-4 mb-6">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              )}
            </div>

            {/* Content Form */}
            <div className="space-y-6 mt-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-slate-900 text-lg font-bold">
                    <User className="w-5 h-5 text-slate-400" />
                    {profile.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-slate-900 font-medium">
                    <Phone className="w-5 h-5 text-slate-400" />
                    {profile.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Skill / Trade</label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.skill}
                    onChange={(e) => setEditForm({...editForm, skill: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="e.g. Plumber, Driver, Handyman"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-slate-900 font-medium">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    {profile.skill || "No primary skill set"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                {isEditing ? (
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows="4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                    placeholder="Tell us about your experience..."
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed font-medium">
                    {profile.bio || "No bio added yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
