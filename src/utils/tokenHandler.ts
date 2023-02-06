import { jwtVerify, SignJWT } from 'jose';
import { CurrentUserType } from '../graphql/types';

export async function getTokenFromData(
  currentUser: CurrentUserType = { id: '', email: '' }
): Promise<string | null> {
  try {
    const alg = 'HS256';
    const token = await new SignJWT({
      id: currentUser.id,
      email: currentUser.email,
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
): Promise<CurrentUserType | null> {
  try {
    if (token) {
      const data: any = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SECRET_JWT)
      );
      const user: CurrentUserType = data.payload;
      return user;
    }
    return null;
  } catch (err: any) {
    console.log(err.toString());
    return null;
  }
}
