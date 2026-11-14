// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// /account-suspended: where a signed-in user lands when the API refuses their
// session with 403 USER_SUSPENDED (see the interceptor in http.ts). The
// session is already gone by then; the notice comes from the navigation state
// or, after the logout's full-page reload, from sessionStorage.
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { SuspendedAccountPanel } from '../components/SuspendedAccountPanel';
import { ModelSuspensionNotice } from '../models';
import { clearSuspension, readSuspension } from '../utils/suspension';
import Wrapper from './AuthPage/Wrapper';

export default function AccountSuspended() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromState = (location.state as { suspension?: ModelSuspensionNotice } | null)?.suspension;
  const notice = fromState ?? readSuspension();

  return (
    <Wrapper>
      <Box sx={{ margin: 'auto 0', width: '100%', display: 'flex', justifyContent: 'center', px: 2 }}>
        <SuspendedAccountPanel
          notice={notice}
          onBack={() => {
            clearSuspension();
            navigate('/login', { replace: true });
          }}
        />
      </Box>
    </Wrapper>
  );
}
