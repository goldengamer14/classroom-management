import express from "express";
import { and, or, ilike, eq, sql, desc, getTableColumns } from "drizzle-orm";
import { subjects, departments } from "../db/schema/index";
import { db } from "../db/index";

const router = express.Router();

// Get all subjects with optional search, filtering, pagination
router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, +page) || 1;
        const pageLimit = Math.max(1, +limit) || 1;

        const offset = (currentPage - 1) * pageLimit;

        const filterConditions = [];

        // If there's something in Search Query, filter by Subject's name or code
        if (search)
            filterConditions.push(
                or(
                    ilike(subjects.name, String(search)),
                    ilike(subjects.code, String(search))
                )
            );

        // If department filter exists, match department name
        if (department) filterConditions.push(
            ilike(departments.name, String(department))
        );

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db.select({
            ...getTableColumns(subjects),
            department: getTableColumns(departments)
        })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(pageLimit)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / pageLimit)
            }
        });
    } catch (err) {
        console.error("GET /subjects error", err);
        res.status(500).json({ error: `Failed to get subjects:\n${err}` });
    }
});

// Get single subject by ID
router.get("/:id", async (req, res) => {
    try {
        const subjectId = parseInt(req.params.id, 10);

        // Validate ID is a number
        if (isNaN(subjectId)) {
            return res.status(400).json({ error: "Invalid subject ID" });
        }

        const result = await db.select({
            ...getTableColumns(subjects),
            department: getTableColumns(departments)
        })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, subjectId));

        // Check if subject exists
        if (!result || result.length === 0) {
            return res.status(404).json({ error: "Subject not found" });
        }

        res.status(200).json({
            data: result[0]
        });
    }
    catch (err) {
        console.error(`GET /subjects/${req.params.id} error`, err);
        res.status(500).json({ error: `Failed to get subject:\n${err}` });
    }
});

// Update a Subject by ID
router.put("/:id", async (req, res) => {
    try {
        const subjectId = parseInt(req.params.id, 10);

        // Validate ID is a number
        if (isNaN(subjectId)) {
            return res.status(400).json({ error: "Invalid subject ID" });
        }

        // Check if subject exists
        const existingSubject = await db.select()
            .from(subjects)
            .where(eq(subjects.id, subjectId));

        if (!existingSubject || existingSubject.length === 0) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Get update data from request body (NOT query params)
        const { code, name, description, departmentId } = req.body;

        // Build update object with only provided fields
        const updateData: any = {};
        if (code) updateData.code = code;
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (departmentId) {
            // Validate department exists if departmentId is being updated
            const parsedDeptId = parseInt(departmentId, 10);
            if (isNaN(parsedDeptId)) {
                return res.status(400).json({ error: "Invalid department ID" });
            }

            const departmentExists = await db.select()
                .from(departments)
                .where(eq(departments.id, parsedDeptId));

            if (!departmentExists || departmentExists.length === 0) {
                return res.status(400).json({ error: `Department with ID ${parsedDeptId} does not exist` });
            }

            updateData.departmentId = parsedDeptId;
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update data provided" });
        }

        // Perform the update
        const updatedSubject = await db.update(subjects)
            .set(updateData)
            .where(eq(subjects.id, subjectId))
            .returning();

        // Fetch the updated subject with department info
        const result = await db.select({
            ...getTableColumns(subjects),
            department: getTableColumns(departments)
        })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, subjectId));

        res.status(200).json({
            message: "Subject updated successfully",
            data: result[0]
        });
    }
    catch (err) {
        console.error(`PUT /subjects/${req.params.id} error`, err);
        res.status(500).json({ error: `Failed to update subject:\n${err}` });
    }
});

router.post("/", async (req, res) => {
    try {
        const { code, name, description, departmentId } = req.body;

        // Validate required fields
        if (!code || !name || !departmentId) {
            return res.status(400).json({
                error: "Missing required fields: code, name, and departmentId are required"
            });
        }

        // Parse and validate departmentId is a number
        const parsedDeptId = parseInt(departmentId, 10);
        if (isNaN(parsedDeptId)) {
            return res.status(400).json({ error: "departmentId must be a valid number" });
        }

        // Check if subject with same code already exists
        const existingCode = await db.select()
            .from(subjects)
            .where(eq(subjects.code, code));

        if (existingCode && existingCode.length > 0) {
            return res.status(409).json({
                error: `Subject with code '${code}' already exists`
            });
        }

        // Check if subject with same name already exists
        const existingName = await db.select()
            .from(subjects)
            .where(eq(subjects.name, name));

        if (existingName && existingName.length > 0) {
            return res.status(409).json({
                error: `Subject with name '${name}' already exists`
            });
        }

        // Validate that department exists
        const departmentExists = await db.select()
            .from(departments)
            .where(eq(departments.id, parsedDeptId));

        if (!departmentExists || departmentExists.length === 0) {
            return res.status(400).json({
                error: `Department with ID ${parsedDeptId} does not exist`
            });
        }

        // Insert the new subject
        const newSubject = await db.insert(subjects)
            .values({
                code,
                name,
                description: description || null,
                departmentId: parsedDeptId
            })
            .returning();

        // Fetch the created subject with department info
        const result = await db.select({
            ...getTableColumns(subjects),
            department: getTableColumns(departments)
        })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, newSubject[0].id));

        res.status(201).json({
            message: "Subject created successfully",
            data: result[0]
        });

    } catch (err) {
        console.error(`POST /subjects error`, err);
        res.status(500).json({
            error: "Failed to create subject",
            details: err instanceof Error ? err.message : String(err)
        });
    }
});

export default router;