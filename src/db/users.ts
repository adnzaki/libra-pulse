import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name?: string, photoURL?: string) {
  const result = await db.insert(users)
    .values({
      uid,
      email,
      name: name || email.split('@')[0],
      avatar: photoURL || undefined,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        ...(name ? { name } : {}),
        ...(photoURL ? { avatar: photoURL } : {}),
      },
    })
    .returning();

  return result[0];
}

export async function getUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
