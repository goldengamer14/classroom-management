// HTML/CSS Components
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Badge, Search } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { ColumnDef } from "@tanstack/react-table";

import { RequestHandler } from "@/pages/subjects/tempRequests";

// Javascript Components
import { useMemo, useState } from "react";
import { DEPARTMENT_OPTIONS } from "@/constants/index.ts";
import { useTable } from "@refinedev/react-table";
import { Department, Subject } from "@/types/index.ts";

const SubjectsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const deptFilter = selectedDepartment !== "all"
    ? [{ field: "department", operator: "eq" as const, value: selectedDepartment }]
    : [];
  const searchFilter = searchQuery ? [{ field: "name", operator: "includesString" as const, value: searchQuery }] : [];

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(() => [
      {
        id: "code",
        accessorKey: "code",
        size: 100,
        header: () => <p className="column-title ml-2">Code</p>,
        cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span>
      },
      {
        id: "name",
        accessorKey: "name",
        size: 200,
        header: () => <p className="column-title">Name</p>,
        cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()}</span>,
        filterFn: "includesString"
      },
      {
        id: "department",
        accessorKey: "department.name",
        size: 150,
        header: () => <p className="column-title">Department</p>,
        cell: ({ getValue }) => <span className="text-foreground">{getValue<string>()?.toUpperCase()}</span>
      },
      {
        id: "description",
        accessorKey: "description",
        size: 300,
        header: () => <p className="column-title">Description</p>,
        cell: ({ getValue }) => <span className="truncate line-clamp-2">{getValue<string>()}</span>
      }
    ], []),

    refineCoreProps: {
      resource: "subjects",
      pagination: {
        pageSize: 10,
        mode: "server"
      },
      filters: {
        permanent: [...deptFilter, ...searchFilter]
      },
      sorters: {
        initial: [{ field: "id", order: "asc" }]
      }
    }
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Subjects</h1>

      <div className="intro-row">

        <p>Quick access to all subjects in the system.</p>

        <div className="actions-row">

          <div className="search-field">
            <Search className="search-icon" />

            <input
              type="text"
              className="pl-10 w-full"
              placeholder="Search by name..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>

              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Departments
                </SelectItem>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>

            </Select>

            <CreateButton />

          </div>

        </div>

      </div>

      <DataTable table={subjectTable} />

      {/* TEMPORARY SECTION */}

      <RequestHandler />

      {/* TEMPORARY SECTION */}
    </ListView>
  );
}

export default SubjectsList;