'use client'
import React from 'react';
import { useState,useEffect } from "react";
import { 
  FaUser, FaLock, FaMoneyBillWave, 
  FaQuestionCircle, FaChevronDown, FaChevronRight, 
  FaSpinner
} from 'react-icons/fa';
import styles from './artistSettings.module.css';

export default function SettingsPage() {
  console.log("hello");
  const [expanded, setExpanded] = useState({
    profile: false,
    account: false,
    payments: false,
    support: false
  });

  const  [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
      const fetchSettingsData= async()=>{
        try{
          const response= await fetch('http://localhost:5000/api/settings/all',{
            method:'GET',
            credentials:'include'
          })

          if (!response.ok){
              throw new Error('Failed to fetch settings data')
          }

          const data= await response.json()
          setSettingsData(data)
          console.log("Settings data:",data)


        }catch(err){
          console.error('Error fetching settings data:', err)
          setError(err.message) 
        }finally{
          setLoading(false)

        }
      }
      fetchSettingsData()
    
  },[])

  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...Object.fromEntries(Object.keys(prev).map(key => [key, false])), // Close all sections
      [section]: !prev[section], // Toggle the clicked section
    }));
  };

  const sections = [
    { id: 'profile', icon: <FaUser />, title: 'Profile Management', component: <ProfileContent /> },
    { id: 'account', icon: <FaLock />, title: 'Account Settings', component: <AccountContent /> },
    { id: 'payments', icon: <FaMoneyBillWave />, title: 'Payment Settings', component: <PaymentsContent /> },
    { id: 'support', icon: <FaQuestionCircle />, title: 'Support & Feedback', component: <SupportContent /> }
  ];

 

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.settingsHeader}>Settings</h1>
      
      <div className={styles.sectionsContainer}>
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`${styles.sectionCard} ${expanded[section.id] ? styles.expanded : ''}`}
          >
            <div 
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.id)}
            >
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                {section.title}
              </div>
              {expanded[section.id] ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            
            {expanded[section.id] && (
              <div className={styles.sectionContent}>
                {React.cloneElement(section.component, {
                  initialData: settingsData,
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileContent({ initialData }) {  
  console.log("Initial data in profile content:",initialData)
  const [name, setName] = useState(initialData?.profile?.basicInfo?.name || "");
  const [bio, setBio] = useState(initialData?.profile?.basicInfo?.bio || "");
  const [profileImage, setProfileImage] = useState(initialData?.profile?.basicInfo?.profileImage || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            return 0;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (imageFile) formData.append('profileImage', imageFile);

      const response = await fetch('http://localhost:5000/api/settings/profile', {
        method: 'POST',
        body: formData,
        credentials: 'include' // For cookies
      });
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      alert('Profile updated successfully!');
      console.log("Result image profile:",result.artist?.profileImage)
      
      // Update with server-side image URL if available
      if (result.artist?.profileImage) {
        // Convert backslashes to forward slashes and prepend base URL
        const imageUrl = `http://localhost:5000/${result.artist.profileImage.replace(/\\/g, '/')}`;
        setProfileImage(imageUrl);
      }
      
    } catch (error) {
      console.error('Update failed:', error);
      alert(error.message);
      // Revert changes if needed
      if (imageFile) {
        setProfileImage(null);
        setImageFile(null);
      }
    } finally {
      setIsSaving(false);
      window.location.reload();
    }
  };

  return (
    <div className={styles.contentWrapper}>
      {/* Profile Picture Upload */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Profile Picture</label>
        <div className={styles.profileImageContainer}>
          <div 
            className={styles.profileImage}
            style={{
              backgroundImage: profileImage ? `url(${profileImage})` : 'none',
              backgroundColor: profileImage ? 'transparent' : '#333'
            }}
          >
            {!profileImage && <FaUser size={24} />}
          </div>
          <div className={styles.uploadControls}>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
            <label htmlFor="profile-upload" className={styles.uploadButton}>
              Change Photo
            </label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Display Name</label>
        <input 
          type="text" 
          className={styles.formInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your artist name"
        />
      </div>

      {/* Bio */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Bio</label>
        <textarea
          className={`${styles.formInput} ${styles.bioInput}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell fans about yourself"
          rows={4}
        />
      </div>

      {/* Save Button */}
      <button 
        className={styles.saveButton}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <span className={styles.spinner}></span>
        ) : (
          'Save Changes'
        )}
      </button>
    </div>
  );
}


function AccountContent({initialData}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
  
    try {
      setIsUpdating(true);
      const response = await fetch('http://localhost:5000/api/settings/changepassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: 'include'
      });
  
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('Server returned non-JSON:', text);
        throw new Error(`Server error: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
  
      if (!response.ok) {
        throw new Error(data.message || "Password change failed");
      }
      
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch(error) {
      alert(error.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsUpdating(false);
    }
  };
 

  const handleDeleteAccount = async () => {
    if (!window.confirm("This will permanently delete all your data. Continue?")) return;
    
    // Simulate deletion API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert("Account deleted successfully");
    // Redirect to home page or logout
  };

  return (
    <div className={styles.contentWrapper}>
      {/* Change Password */}
      <div className={styles.securitySection}>
        <h3 className={styles.sectionTitle}>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Current Password</label>
            <input
              type="password"
              className={styles.formInput}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>New Password</label>
            <input
              type="password"
              className={styles.formInput}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
    
              required
            />
          </div>
        
          <button 
            type="submit" 
            className={`${styles.saveButton} mt-4`}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Account Deletion */}
      <div className={styles.securitySection}>
        <h3 className={styles.sectionTitle} style={{ color: "#ff4d4d" }}>Danger Zone</h3>
        <div className={styles.formGroup}>
          <p className={styles.warningText}>
            Deleting your account will permanently remove all your data.
            This action cannot be undone.
          </p>
          <button 
            className={styles.deleteButton}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account Permanently
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirm Account Deletion</h3>
            <p>Are you absolutely sure? This will:</p>
            <ul className={styles.warningList}>
              <li>Delete all your songs and data</li>
              <li>Remove your artist profile</li>
              <li>Cannot be reversed</li>
            </ul>
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={handleDeleteAccount}
              >
                I Understand, Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




function PaymentsContent({initialData}) {
  const [bankAccount, setBankAccount] = useState(initialData?.profile?.paymentSettings?.bankAccount || "")
  const [payoutEmail, setPayoutEmail] = useState(initialData?.profile?.paymentSettings?.payoutEmail || "")
  const [autoPayout, setAutoPayout] = useState(initialData?.profile?.paymentSettings?.autoPayout || true)
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePaymentSettings = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('http://localhost:5000/api/settings/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankAccount,
          payoutEmail,
          autoPayout
        }),
        credentials: 'include' // For cookies/session
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to save payment settings");
      }
  
      alert("Payment settings saved successfully!");
    } catch (error) {
      alert("Error saving payment settings: " + error.message);
    } finally {
      setIsSaving(false);
      window.location.reload();
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.paymentSection}>
        <h3 className={styles.sectionTitle}>Account Details</h3>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Bank Account</label>
          <input
            type="text"
            className={styles.formInput}
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter bank account number"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Payout Email</label>
          <input
            type="email"
            className={styles.formInput}
            value={payoutEmail}
            onChange={(e) => setPayoutEmail(e.target.value)}
            placeholder="Enter payout email"
          />
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h3 className={styles.sectionTitle}>Payout Preferences</h3>
        <div className={styles.toggleOption}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={autoPayout}
              onChange={() => setAutoPayout(!autoPayout)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
            Automatic Monthly Payouts
          </label>
        </div>
      </div>

      <button className={styles.saveButton}
      onClick={handleSavePaymentSettings} 
      disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Payment Settings'}
      </button>
    </div>
  );
}

function SupportContent() {
  return (
    <div className={styles.contentWrapper}>
      <div className={styles.supportSection}>
        <h3>Help & Support</h3>
        <div className={styles.supportOptions}>
          <div className={styles.optionCard}>
            <h4>FAQs</h4>
            <p>Find answers to common questions</p>
            <button className={styles.supportButton}>Browse FAQs</button>
          </div>
          
          <div className={styles.optionCard}>
            <h4>Contact Us</h4>
            <p>Reach out to our support team</p>
            <button className={styles.supportButton}>Send Message</button>
          </div>
          
          <div className={styles.optionCard}>
            <h4>Feedback</h4>
            <p>Share your experience with us</p>
            <button className={styles.supportButton}>Provide Feedback</button>
          </div>
        </div>
      </div>
    </div>
  );
}