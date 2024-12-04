import React, { useState } from "react";
import { Api } from "../../services/api.ts";


const CreateTeam = () => {
  const [teamName, setTeamName] = useState("");

  // Function to handle the email input change
  const handleInputChange = (e) => {
    setTeamName(e.target.value);
  };

  const createTeam = async () => {
    await Api.createTeam({
      name: teamName,
      slug: teamName,
    })
  };

  return (
    <div className="invite-user">
      <h2>Invite User by Email</h2>
      <input
        type="name"
        value={teamName}
        onChange={handleInputChange}
        placeholder="Enter new team name"
        className="email-input"
      />
      <button onClick={createTeam} className="invite-button">
        submit
      </button>
    </div>
  );
};

export default CreateTeam;
