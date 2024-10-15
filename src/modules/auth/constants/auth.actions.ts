'use server';

import { signIn, signOut } from './auth.config';
import { User } from 'types/chat';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { kv } from '@vercel/kv';
import { ResultCode, getStringFromBuffer } from '@/modules/chat/utils/utils';

interface Result {
  type: string;
  resultCode: ResultCode;
}

export async function getUser(email: string) {
  const user = await kv.hgetall<User>(`user:${email}`);
  return user;
}

export async function logout() {
  await signOut;
  return {
    type: 'success',
    resultCode: ResultCode.UserLoggedOut
  };
}

export async function authenticate({ username, password }: any): Promise<Result | undefined> {
  try {
    const parsedCredentials = z
      .object({
        username: z.string().min(6),
        password: z.string().min(6)
      })
      .safeParse({
        username,
        password
      });

    if (parsedCredentials.success) {
      await signIn('credentials', {
        username,
        password,
        redirect: false
      });

      return {
        type: 'success',
        resultCode: ResultCode.UserLoggedIn
      };
    } else {
      return {
        type: 'error',
        resultCode: ResultCode.InvalidCredentials
      };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            type: 'error',
            resultCode: ResultCode.InvalidCredentials
          };
        default:
          return {
            type: 'error',
            resultCode: ResultCode.UnknownError
          };
      }
    }
  }
}
export async function createUser(username: string, hashedPassword: string, salt: string) {
  const existingUser = await getUser(username);

  if (existingUser) {
    return {
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists
    };
  } else {
    const user = {
      id: crypto.randomUUID(),
      username,
      password: hashedPassword,
      salt
    };

    await kv.hmset(`user:${username}`, user);

    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    };
  }
}

interface Result {
  type: string;
  resultCode: ResultCode;
}

export async function signup({ username, password }: any): Promise<Result | undefined> {
  const parsedCredentials = z
    .object({
      username: z.string().min(6),
      password: z.string().min(6)
    })
    .safeParse({
      username,
      password
    });

  if (parsedCredentials.success) {
    const salt = crypto.randomUUID();

    const encoder = new TextEncoder();
    const saltedPassword = encoder.encode(password + salt);
    const hashedPasswordBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
    const hashedPassword = getStringFromBuffer(hashedPasswordBuffer);

    try {
      const result = await createUser(username, hashedPassword, salt);

      if (result.resultCode === ResultCode.UserCreated) {
        await signIn('credentials', {
          username,
          password,
          redirect: false
        });
      }

      return result;
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return {
              type: 'error',
              resultCode: ResultCode.InvalidCredentials
            };
          default:
            return {
              type: 'error',
              resultCode: ResultCode.UnknownError
            };
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError
        };
      }
    }
  } else {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    };
  }
}
