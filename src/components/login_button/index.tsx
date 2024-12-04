import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React from "react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  <button style={{ opacity: 1 }} onClick={() => loginWithRedirect({
  })}>Log In</button>;
  return <Button
    sx={{ boxShadow: 'none' }}
    onClick={() => loginWithRedirect({
    })}
    variant="contained"
    size="large"
    startIcon={<LockOutlinedIcon />}
    sx={{ mt: 2 }}
  > Login </Button>
};

export default LoginButton;