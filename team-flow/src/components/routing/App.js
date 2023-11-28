import React from 'react';
import SignUp from '../views/SignUp';
import SignIn from '../views/SignIn';
import ResetPassword from '../views/ResetPassword';
import PrivateRoute from '../routing/PrivateRoute';
import RedirectIfLoggedIn from '../routing/RedirectIfLoggedIn';
import { AuthProvider } from '../../contexts/AuthContext';
import { UserTeamDataProvider } from '../../contexts/TeamContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmailVerification from '../views/EmailVerification';
import Dashboard from '../views/Dashboard';
import Schedule from '../views/Schedule';
import Statistics from '../views/Statistics';
import Team from '../views/Team';
import SelectTeam from '../views/SelectTeam';
import Tasks from '../views/Tasks';
import Chat from '../views/Chat';
import NotFound from '../views/NotFound';
import { UserProvider } from '../../contexts/UserContext';
import { ChatProvider } from '../../contexts/ChatContext';
function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
        <UserTeamDataProvider>
        <ChatProvider>

          <Routes>
            <Route exact path='/:teamId/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path='/:teamId/schedule' element={<PrivateRoute><Schedule /></PrivateRoute>} />
              <Route path='/:teamId/statistics' element={<PrivateRoute><Statistics /></PrivateRoute>} />
              <Route path='/:teamId/team' element={<PrivateRoute><Team /></PrivateRoute>} />
              <Route path='/:teamId/tasks' element={<PrivateRoute><Tasks /></PrivateRoute>} />
              <Route path='/:teamId/chat' element={<PrivateRoute><Chat /></PrivateRoute>} />

            <Route path='/' element={<PrivateRoute><SelectTeam /></PrivateRoute>} />
            <Route
              path='/sign-in'
              element={
                <RedirectIfLoggedIn>
                  <SignIn />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path='/sign-up'
              element={
                <RedirectIfLoggedIn>
                  <SignUp />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path='/reset-password'
              element={
                <RedirectIfLoggedIn>
                  <ResetPassword />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path='/verify'
              element={
                <PrivateRoute>
                  <EmailVerification />
                </PrivateRoute>
              }
            ></Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
                    
        </ChatProvider>
        </UserTeamDataProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
