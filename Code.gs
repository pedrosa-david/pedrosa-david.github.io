// Handle preflight OPTIONS request
function doOptions(e) {
  const origin = e.headers["Origin"] || e.headers["origin"];
  const allowedOrigins = [
    "https://www.amira-david.com",
    "http://127.0.0.1:4001",
    "http://localhost:4001",
  ];

  // Check if the origin is allowed
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
}

function doPost(e) {
  const origin = e.headers["Origin"] || e.headers["origin"];
  const allowedOrigins = [
    "https://www.amira-david.com",
    "http://127.0.0.1:4001",
    "http://localhost:4001",
  ];

  // Check if the origin is allowed
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  // Set CORS headers for the main request
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Process each guest and add them to the sheet
    data.guests.forEach((guest) => {
      const row = [
        new Date(), // Timestamp
        guest.name, // Name
        guest.email, // Email
        guest.phone, // Phone
        guest.participates, // Participates
        guest.bus, // Bus
        guest.menuType, // Menu Type
        guest.menuDiet, // Menu Diet
      ];

      sheet.appendRow(row);
    });

    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "Data saved successfully",
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        message: error.toString(),
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}
