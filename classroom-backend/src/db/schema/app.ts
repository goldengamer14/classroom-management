import { pgTable, varchar, integer, timestamp, PgTable } from "drizzle-orm/pg-core";
import { relations} from "drizzle-orm";

const timestamps = {
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
}

export const departments = pgTable("departments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 10 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    ...timestamps
});

export const subjects = pgTable("subjects", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 10 }).unique().notNull(),
    departmentId: integer("departmentId").references(() => departments.id, { onDelete: "restrict" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    ...timestamps
});

export const departmentRelations = relations(departments, ({ many }) => ({ subjects: many(subjects) }));

export const subjectRelations = relations(subjects, ({ one, many }) => ({
    department: one(departments, { fields: [subjects.departmentId], references: [departments.id] }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;