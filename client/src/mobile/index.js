import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Nav from './Nav';
import DmList from '../components/dm_list';
import Discover from '../components/discover';
import Channel from '../components/channel';
import Profile from '../components/profile';
import Settings from '../components/settings';
import Friends from '../components/friends';

import './Mobile.css';

const Mobile = () => {
  return (
    <>
    <Switch>
      <Route exact path="/messages" component={DmList} />
      <Route exact path="/discover" component={Discover} />
      <Route exact path="/profile" component={Profile} />
      <Route exact path="/profile/settings" component={Settings} />
      <Route exact path="/profile/friends" component={Friends} />
      <Route exact path="/profile/requests" component={null} />
      <Route exact path="/profile/blocks" component={null} />
      <Redirect to="/discover" />
    </Switch>
    <Nav />
    <Channel />
    </>
  );
};

export default Mobile;
