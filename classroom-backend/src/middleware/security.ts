import type { Request, Response, NextFunction } from "express";
import type { RateLimitRole } from "../type.d.ts";
import aj from "../config/arcjet";
import { slidingWindow, type ArcjetNodeRequest } from "@arcjet/node";


const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test") return next();

    try {
        const role: RateLimitRole = req.user?.role || "guest";

        let limit: number;

        switch (role) {
            case "admin":
                limit = 20;
                break;

            case "teacher":
            case "student":
                limit = 10;
                break;

            default:
                limit = 5;
                break;
        };

        const client = aj.withRule(
            slidingWindow({
                mode: "LIVE",
                interval: "1m",
                max: limit
            })
        );

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: { remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0" },
        };

        const decision = await client.protect(arcjetRequest);

        if (decision.isDenied() && decision.reason.isBot())
            return res.status(403).json({
                error: "Forbidden",
                message: "Automated requests are not allowed."
            });


        if (decision.isDenied() && decision.reason.isShield())
            return res.status(403).json({
                error: "Forbidden",
                message: "Shield protection triggered."
            });

        if (decision.isDenied() && decision.reason.isRateLimit())
            return res.status(429).json({
                error: "Too Many Requests",
                message: `${role.charAt(0).toUpperCase() + role.slice(1)} rate limit exceeded(${limit} per minute). ${role === "guest" ? "Please sign up or log in to increase your rate limit." : "Please try again later."}`
            });

        next();
    } catch (err) {
        console.error("Security middleware error:", err);
        res.status(500).json({
            error: "Internal server error",
            message: err ?? "Something went wrong with the Security Middleware"
        });
    }
};

export default securityMiddleware;