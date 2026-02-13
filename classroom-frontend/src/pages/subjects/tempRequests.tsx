import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const RequestHandler = () => {
    const [requestType, setRequestType] = useState("GET");
    const [tableType, setTableType] = useState("subjects");
    const [id, setId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async () => {
        const method = requestType;
        const url = `http://localhost:8000/api/${tableType}${method !== "POST" ? `/${id}` : ""}`;

        const requestBody = (method === "POST" || method === "PUT") ? {
            code: code,
            name: name,
            description: description,
            ...(tableType === "subjects" && { departmentId: departmentId })
        } : null;

        const options = {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: requestBody ? JSON.stringify(requestBody) : null
        };

        console.table(options);

        try {
            const res = await fetch(url, options);
            const data = await res.json();
            console.log(data);
            setResponse(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(err);
            setResponse(`Error: ${err}`);
        }
    };

    const flexDiv = {
        display: "flex",
        width: "100%",
        justifyContent: "space-evenly"
    };

    const optionsStyle = { backgroundColor: "rgb(26, 26, 26)" };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            margin: "2rem",
            textAlign: "left"
        }}>
            <div style={flexDiv}>
                <select style={optionsStyle} value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                    <option value="GET" style={optionsStyle}>GET</option>
                    <option value="POST" style={optionsStyle}>POST</option>
                    <option value="PUT" style={optionsStyle}>PUT</option>
                    <option value="DELETE" style={optionsStyle}>DELETE</option>
                </select>

                <select style={optionsStyle} value={tableType} onChange={(e) => setTableType(e.target.value)}>
                    <option value="subjects" style={optionsStyle}>Subject</option>
                    <option value="departments" style={optionsStyle}>Department</option>
                </select>

                <Input
                    type="number"
                    placeholder="ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
            </div>

            <div style={flexDiv}>
                <Input
                    type="text"
                    placeholder="Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <Input
                    type="number"
                    placeholder="Department ID"
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                />

                <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div style={flexDiv}>
                <Textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                        height: "8rem"
                    }}
                />
            </div>

            <div style={flexDiv}>
                <Button
                    variant="default"
                    size="lg"
                    onClick={handleSubmit}
                    style={{ cursor: "pointer", color: "#ececec" }}
                >
                    Submit Request
                </Button>
            </div>

            {(
                <div style={{
                    padding: "10px",
                    border: "1px solid #555555",
                    backgroundColor: "#2a2a2a",
                    whiteSpace: "pre-wrap",
                    color: "#ffffff"
                }}>
                    {response}
                </div>
            )}
        </div>
    );
}