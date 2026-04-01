import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generate } from "generate-password";

export const seedUser = action({
  args: {},
  handler: async (ctx) => {
    const email = "jnurbina@gmail.com";

    // Check if user already exists
    const existingUser = await ctx.runQuery(api.users.getUserByEmail, { email });

    if (!existingUser) {
      const password = generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
      });

      console.log(`Pre-seeding user: ${email} with password: ${password}`);

      await ctx.runMutation(api.auth.createUser, {
        email: email,
        username: email.split('@')[0], // Simple username from email
        externalId: `seeded-user-${email}`, // A placeholder externalId for seeded users
      });
      return `User ${email} created with password: ${password}`;
    } else {
      return `User ${email} already exists.`;
    }
  },
});
