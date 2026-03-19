import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BaseRecord, DataProvider, GetListParams, GetListResponse, HttpError } from "@refinedev/core";
// import { API_URL } from "./constants";
// import { mockSubjects } from "@/constants/subjects";
import { BACKEND_BASE_URL } from "@/constants";
import { ListResponse } from "@/types";

if (!BACKEND_BASE_URL)
  throw new Error("BACKEND_BASE_URL is not defined in environment variables");

const buildHTTPError = async (response: Response): Promise<HttpError> => {
  let message = "Request failed with status " + response.status;

  try {
    const payload = (await response.json()) as { message?: string };
    message = payload.message || message;
  } catch (err) {
    console.warn("Failed to parse error response as JSON:", err);
  }

  return {
    message: message,
    statusCode: response.status,
  };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1,
        pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = { page, limit: pageSize };

      filters?.forEach(filter => {
        const field = "field" in filter ? filter.field : "",
          value = String(filter.value);

        if (resource === "subjects") {
          if (field === "department") params.department = value;
          if (field === "name" || field === "code") params.search = value;
        }
      });

      return params;
    },

    mapResponse: async response => {
      if (!response.ok) throw await buildHTTPError(response);

      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },

    getTotalCount: async response => {
      if (!response.ok) throw await buildHTTPError(response);

      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };