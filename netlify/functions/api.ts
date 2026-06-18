import express from "express";
import serverless from "serverless-http";
import { app } from "../../server";

const netlifyApp = express();

// A request to /api/foo gets rewritten by Netlify to /.netlify/functions/api/foo 
// by the [[redirects]] rule: from = "/api/*", to = "/.netlify/functions/api/:splat"
// That means the path received by the function is /.netlify/functions/api/foo.
// Since server.ts expects the path "/api/foo", we mount it at "/.netlify/functions"
netlifyApp.use('/.netlify/functions', app);

export const handler = serverless(netlifyApp);
