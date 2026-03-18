import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  // relations,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { user } from "./auth";

const timestamps = {
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
};

const snakeTimestamps = {
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
};

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 10 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  ...timestamps,
});

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 10 }).unique().notNull(),
  departmentId: integer("departmentId")
    .references(() => departments.id, { onDelete: "restrict" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  ...timestamps,
});

export const classStatus = pgEnum("class_status", ["active", "inactive", "archived"]);

export const classes = pgTable(
  "classes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    inviteCode: varchar("invite_code", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    bannerCldPubId: text("bannerCldPubId"),
    bannerUrl: text("bannerUrl"),
    description: text("description"),
    capacity: integer("capacity").default(50).notNull(),
    status: classStatus("status").default("active").notNull(),
    schedules: jsonb("schedules").$type<Record<string, unknown>[]>(),
    ...snakeTimestamps,
  },
  (table) => ({
    subjectIndex: index("idx_classes_subject_id").on(table.subjectId),
    teacherIndex: index("idx_classes_teacher_id").on(table.teacherId),
    inviteCodeUnique: uniqueIndex("uq_classes_invite_code").on(table.inviteCode),
  }),
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    ...snakeTimestamps,
  },
  (table) => ({
    studentIndex: index("idx_enrollments_student_id").on(table.studentId),
    classIndex: index("idx_enrollments_class_id").on(table.classId),
    uniqueEnrollment: uniqueIndex("uq_enrollments_student_class").on(
      table.studentId,
      table.classId,
    ),
  }),
);

export const departmentRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectRelations = relations(subjects, ({ many, one }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  classes: many(classes),
}));

export const classRelations = relations(classes, ({ many, one }) => ({
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }),
  teacher: one(user, {
    fields: [classes.teacherId],
    references: [user.id],
  }),
  enrollments: many(enrollments),
}));

export const enrollmentRelations = relations(enrollments, ({ one }) => ({
  student: one(user, {
    fields: [enrollments.studentId],
    references: [user.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;