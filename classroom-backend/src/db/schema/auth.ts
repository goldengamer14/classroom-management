import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

const timestamps = {
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
};

export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(), // Better Auth expects text PK
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified"), // Removed .nullable() - Drizzle makes it nullable by default
    image: text("image"), // Removed .nullable()

    // Extra fields required by your project
    role: roleEnum("role").default("student").notNull(),
    imageCldPubId: text("imageCldPubId"), // Already nullable by default

    ...timestamps,
  },
  (table) => ({
    emailIndex: index("idx_user_email").on(table.email),
    emailUnique: uniqueIndex("uq_user_email").on(table.email),
  }),
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
    ...timestamps,
  },
  (table) => ({
    sessionTokenUnique: uniqueIndex("uq_session_sessionToken").on(table.sessionToken),
    userIdIndex: index("idx_session_userId").on(table.userId),
  }),
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"), // Removed .nullable()
    access_token: text("access_token"), // Removed .nullable()
    expires_at: timestamp("expires_at"), // Removed .nullable()
    token_type: text("token_type"), // Removed .nullable()
    scope: text("scope"), // Removed .nullable()
    id_token: text("id_token"), // Removed .nullable()
    session_state: text("session_state"), // Removed .nullable()
    ...timestamps,
  },
  (table) => ({
    providerAccountUnique: uniqueIndex("uq_account_provider_providerAccountId").on(
      table.provider,
      table.providerAccountId,
    ),
    userIdIndex: index("idx_account_userId").on(table.userId),
  }),
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
    ...timestamps,
  },
  (table) => ({
    identifierIndex: index("idx_verification_identifier").on(table.identifier),
    tokenUnique: uniqueIndex("uq_verification_token").on(table.token),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// Removed verificationRelations as Better Auth does not define a relation from verification to user