import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare, hash } from 'bcryptjs';
import { kv } from '@vercel/kv';

interface User {
  id: string;
  username: string;
  password: string;
}

// Add this function to generate a unique ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getUser(username: string): Promise<User | null> {
  const user = await kv.hgetall(`user:${username}`);
  return user as User | null;
}

export async function registerUser(username: string, password: string): Promise<User | null> {
  try {
    // Check if the username already exists
    const existingUser = await kv.hgetall(`user:${username}`);
    if (existingUser) {
      console.log(`Username ${username} already exists`);
      return null;
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create a new user object
    const newUser: User = {
      id: generateUniqueId(), // Use the new function here
      username,
      password: hashedPassword
    };

    // Store the new user in the KV database
    await kv.hmset(`user:${username}`, newUser as any);

    console.log(`User ${username} registered successfully`);
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Wallet Address', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing wallet address or password');
          return null;
        }

        try {
          const user = await getUser(credentials.username);

          if (!user) {
            console.log('User not found');
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }

          console.log('Authentication successful');
          return {
            id: user.id,
            username: user.username
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
