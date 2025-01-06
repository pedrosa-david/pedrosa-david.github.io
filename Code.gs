// Handle preflight OPTIONS request
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "https://www.amira-david.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "3600",
    });
}

function doPost(e) {
  // Set CORS headers for the main request
  const headers = {
    "Access-Control-Allow-Origin": "https://www.amira-david.com",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
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

    // Return success response with CORS headers
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "Data saved successfully",
      })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    // Return error response with CORS headers
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
