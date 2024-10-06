import { SignInDto, SignInResponse, SignUpResponse } from '../interfaces/auth.interface';

import { AUTH_AUTHENTICATOR } from '../constants/auth.constant';
import { API_ENDPOINTS } from '@/common/constants/api-endpoint.constant';
import axiosClient from '@/common/http/http-request';

export const signUp = (userDto: { email: string; password: string }) => {
  return axiosClient.post<SignUpResponse>(API_ENDPOINTS.SIGN_UP, userDto); //UserEntity
};

export const signIn = (signInDto: SignInDto) => {
  return axiosClient.post<SignInResponse>(API_ENDPOINTS.SIGN_IN, signInDto);
};

export const googleSignIn = (authenticator: AUTH_AUTHENTICATOR, token: string) => {
  return axiosClient.post<SignInResponse>(API_ENDPOINTS.SIGN_IN_GOOGLE, { authenticator, token });
};

export const facebookSignIn = (authenticator: AUTH_AUTHENTICATOR, token: string, limited: boolean) => {
  return axiosClient.post<SignInResponse>(API_ENDPOINTS.SIGN_IN_FACEBOOK, {
    authenticator,
    token,
    isFacebookLimited: limited
  });
};

const AuthApi = { signUp, signIn, googleSignIn, facebookSignIn };

export default AuthApi;
