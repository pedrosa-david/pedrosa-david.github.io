function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = e.parameter; // Get form data directly

    const row = [
      new Date(), // Timestamp
      data.fullName || "", // Name
      data.email, // Email
      data.phone, // Phone
      data.busService || "no", // Bus
      data.participation, // Participates
      data.menuType || "", // MenuType
      data.menuDiet || "", // MenuDiet
    ];

    sheet.appendRow(row);
    return ContentService.createTextOutput("Success!");
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

function doOptions(e) {
  return handleRequest(e, () => ({}));
}

function handleRequest(e, processRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  try {
    const result = processRequest();
    return ContentService.createTextOutput(JSON.stringify(result))
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
