import { createAPIAction } from './apiActions';
import { makeFormError } from './errorActions';
import { initSocket, closeSocket } from '../../api/socket';

export const REGISTER_AS_GUEST = 'session:guest';
export const REGISTER = 'session:register';
export const LOGIN = 'session:login';
export const LOGGED_IN = 'session:loginSuccess';
export const LOGOUT = 'session:logout';
export const LOGGED_OUT = 'sesion:logoutSuccess';
export const MARCO = 'session:marco';
export const UPGRADE = 'session:upgrade';
export const CHANGED_DISPLAY_NAME = 'session:changedDisplayName';
export const CHANGE_PFP = 'session:changePfp';
export const CHANGED_PFP = 'session:changedPfp';

export function marco()
{
  return createAPIAction({
    url: '/account/marco',
    method: 'GET',
    data: {},
    onSuccess: loggedIn,
    onFailure: loggedOut,
    label: MARCO,
  });
}
export function login({ usernameOrEmail, password })
{
  return createAPIAction({
    url: '/account/login',
    method: 'POST',
    data: { usernameOrEmail, password },
    onSuccess: loggedIn,
    onFailure: makeFormError('Username or password is incorrect.'),
    label: LOGIN,
  });
}
function loggedIn(response)
{
  initSocket();
  return {
    type: LOGGED_IN,
    payload: response.data,
  };
}

export function logout()
{
  return createAPIAction({
    url: '/account/logout',
    method: 'POST',
    onSuccess: loggedOut,
  });
}
function loggedOut()
{
  closeSocket();
  return {
    type: LOGGED_OUT,
  };
}

export function register({ username, email, password })
{
  return createAPIAction({
    url: '/account/register',
    method: 'POST',
    data: { username, email, password },
    onSuccess: loggedIn,
    onFailure: makeFormError(),
    label: REGISTER,
  });
}

export function registerAsGuest({ displayName })
{
  return createAPIAction({
    url: '/account/guest',
    method: 'POST',
    data: { displayName },
    onSuccess: loggedIn,
    onFailure: makeFormError(),
    label: REGISTER_AS_GUEST,
  });
}

export function upgradeAccount({ username, email, password })
{
  return createAPIAction({
    url: '/account/upgrade',
    method: 'PUT',
    data: { username, email, password },
    onSuccess: loggedIn,
    onFailure: makeFormError(),
    label: UPGRADE,
  });
}

export function changeDisplayName(displayName)
{
  return createAPIAction({
    url: '/account/displayName',
    method: 'PUT',
    data: { displayName },
    onSuccess: makeChangedDisplayName(displayName),
  });
}
function makeChangedDisplayName(displayName)
{
  return function changedDisplayName()
  {
    return {
      type: CHANGED_DISPLAY_NAME,
      payload: { displayName },
    }
  }
}

export function changePfp(file)
{
  const fileData = new FormData();
  fileData.append('image', file);
  return createAPIAction({
    url: '/account/pfp',
    method: 'PUT',
    file: true,
    data: fileData,
    label: CHANGE_PFP,
    onSuccess: changedPfp,
  })
}
function changedPfp(response)
{
  return {
    type: CHANGED_PFP,
    payload: { pfp: response.data.pfp },
  }
}

export function deleteAccount()
{
  return createAPIAction({
    url: '/account',
    method: 'DELETE',
    onSuccess: loggedOut,
  })
}