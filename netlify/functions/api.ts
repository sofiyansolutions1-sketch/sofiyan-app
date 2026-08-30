import express from "express";
import serverless from "serverless-http";
import { app } from "../../server";

const netlifyApp = express();

// Handle all path variations when called via Netlify Functions or custom redirects
netlifyApp.use('/.netlify/functions/api', app);
netlifyApp.use('/.netlify/functions', app);
netlifyApp.use('/api', app);
netlifyApp.use('/', app);

export const handler = serverless(netlifyApp);
