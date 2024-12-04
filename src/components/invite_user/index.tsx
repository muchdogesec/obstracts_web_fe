import { Label } from '@mui/icons-material';
import { Checkbox, MenuItem, Select } from '@mui/material';
import React, { useState } from 'react';

const InviteUser = () => {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to handle the email input change
  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  // Function to handle the invite button click
  const handleInvite = () => {
    if (validateEmail(email)) {
      console.log(`Inviting user with email: ${email}`);
      // Add logic to send the invitation (e.g., API call)
      alert(`Invitation sent to ${email}`);
      setEmail(''); // Clear input after submission
    } else {
      alert('Please enter a valid email address.');
    }
  };

  // Function to validate the email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };


  return (
    <div className="invite-user">
      <h2>Invite User by Email</h2>
      <input
        type="email"
        value={email}
        onChange={handleInputChange}
        placeholder="Enter email"
        className="email-input"
      />
      <div>Is admin</div>
      <Checkbox
        checked={isAdmin}
        onChange={() => setIsAdmin(!isAdmin)}
      />
      <button onClick={handleInvite} className="invite-button">
        Send Invitation
      </button>
    </div>
  );
};

export default InviteUser;
