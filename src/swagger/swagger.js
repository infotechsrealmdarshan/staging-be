import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🔐 Authentication API",
      version: "1.0.0",
      description: "Complete authentication system API documentation with Firebase integration",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(process.cwd(), "src/routes/*.js")], // More robust path for serverless
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app, port) => {
  // 1. Serve the Swagger JSON specification
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // 2. Serve a custom HTML page for Swagger UI
  app.get("/api-docs", (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>🔐 Authentication API Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
      });
    };
  </script>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });

  console.log(`📘 Swagger Docs available at: /api-docs`);
};
