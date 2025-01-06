function doPost(e) {
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
  ).setMimeType(ContentService.MimeType.JSON);
}
