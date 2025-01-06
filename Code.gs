function doPost(e) {
  return handleRequest(e, () => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    data.guests.forEach((guest) => {
      const row = [
        new Date(),
        guest.name,
        guest.email,
        guest.phone,
        guest.participates,
        guest.bus,
        guest.menuType,
        guest.menuDiet,
      ];
      sheet.appendRow(row);
    });

    return { result: "success", message: "Data saved successfully" };
  });
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
