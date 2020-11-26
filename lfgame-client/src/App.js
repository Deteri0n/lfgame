import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Fragment, useState } from "react";

import NavBar from './pages/Nav_bar/NavBar';
import GamesPage from './pages/Games_page/GamesPage';
import LoginPage from './pages/Login_page/LoginPage';
import RegisterPage from './pages/Register_page/RegisterPage';
import SessionPage from './pages/Session_page/SessionPage';
import MenuBar from './pages/Menu_bar/MenuBar';

import './App.scss';

import useApplicationData from "./hooks/useApplication.js"
import ProfilePage from './pages/Profile_page/ProfilePage';

const App = () => {
  
  const {
    state,
    dispatch
  } = useApplicationData();

  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [currentSession, setCurrentSession] = useState(null);

  const logout = () => {
    setCurrentUser(null);
    setCurrentSession(null)
    localStorage.removeItem("user");
  };
  
  const redirectLogin = () => {
    if (!currentUser) {
      return <Redirect to="/login" />;
    }
  }

  const redirectGames = () => {
    if (currentUser) {
      return <Redirect to="/" />;
    }
  }

  const checkForSession = () => {

    if (!currentUser) {
      return redirectLogin();
    } else if (currentUser && !currentSession) {
      return <Redirect to="/" />;
    }
  }

  return (
    <div id="App" >
      <Router>
        <NavBar currentUser={currentUser} logout={() => logout()}/>
        <Switch>
          
            <Route exact path="/">
              {redirectLogin() || <GamesPage currentUser={currentUser} setCurrentSession={setCurrentSession}/> }
            </Route>

            <Route exact path="/sessions">
            {!currentSession ? checkForSession() : <SessionPage currentSession={currentSession} currentUser={currentUser}/>}
            </Route>

            <Route exact path="/profile">
              {redirectLogin() || <ProfilePage currentUser={currentUser} />}
            </Route>

            <Route exact path ="/register">
              {redirectGames() || <RegisterPage setCurrentUser={setCurrentUser}/>}
            </Route>
          
            <Route exact path ="/login">
              {redirectGames() || <LoginPage setCurrentUser={setCurrentUser}/>}         
            </Route>
          

          <Route path="*">
            <h1>404 - Not Found</h1>
          </Route>
        </Switch>
        <MenuBar currentUser={currentUser} logout={() => logout()}/>
      </Router>
    </div>
  );
};

export default App;
