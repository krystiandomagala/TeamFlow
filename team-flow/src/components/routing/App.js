import React from 'react';
import SignUp from '../views/SignUp';
import SignIn from '../views/SignIn';
import ResetPassword from '../views/ResetPassword';
import ResetPasswordForm from '../views/ResetPasswordForm';
import PrivateRoute from '../routing/PrivateRoute';
import RedirectIfLoggedIn from '../routing/RedirectIfLoggedIn';
import { AuthProvider } from '../../contexts/AuthContext';
import { UserTeamDataProvider } from '../../contexts/UserTeamContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmailVerification from '../views/EmailVerification';
import Dashboard from '../views/Dashboard';
import Schedule from '../views/Schedule';
import Statistics from '../views/Statistics';
import Team from '../views/Team';
import SelectTeam from '../views/SelectTeam';
import Tasks from '../views/Tasks';
import Chat from '../views/Chat';

function App() {
  return (
    <Router>
      <AuthProvider>
      <UserTeamDataProvider>
        <Routes>
          <Route
            path='/'
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          ></Route>

          <Route path='/schedule' element={<Schedule />} />
          <Route path='/statistics' element={<Statistics />} />
          <Route path='/team' element={<Team />} />
          <Route path='/select-team' element={<SelectTeam />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/chat' element={<Chat />} />
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
            path='/reset-password-form'
            element={
              <RedirectIfLoggedIn>
                <ResetPasswordForm />
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
        </Routes>
        </UserTeamDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;