import { jwtVerify, SignJWT } from 'jose';

interface User {
  id: string;
  email: string;
}

interface JWT {
  payload: User;
  protectedHeader: {
    alg: string;
  };
}

export async function getTokenFromData(user: User): Promise<string | null> {
  try {
    const alg = 'HS256';
    const token = await new SignJWT({
      id: user.id || '',
      email: user.email || '',
    })
      .setProtectedHeader({ alg })
      .sign(new TextEncoder().encode(process.env.SECRET_JWT));
    return token;
  } catch (err: any) {
    console.log(err.toString());
    return null;
  }
}

export async function getDataFromToken(
  token: string | undefined
): Promise<User | null> {
  try {
    if (token) {
      const data: any = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SECRET_JWT)
      );
      const user: User = data.payload;
      return user;
    }
    return null;
  } catch (err: any) {
    console.log(err.toString());
    return null;
  }
}
