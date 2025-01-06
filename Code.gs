function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = e.parameter;

    // Array to store all guest entries
    let guests = [];

    if (data.participation === "no") {
      // Single non-participating guest
      guests.push([
        new Date(), // Timestamp
        data.fullName || "", // Name
        data.email, // Email
        data.phone, // Phone
        "no", // Bus
        "no", // Participates
        "", // MenuType
        "", // MenuDiet
      ]);
    } else {
      // Process adult guests
      const adultCount = parseInt(data.numAdults) || 0;
      for (let i = 0; i < adultCount; i++) {
        const guestName = data[`adult_${i}_name`];
        const dietary = data[`adult_${i}_dietary`];
        const dietaryNotes =
          dietary === "other" ? data[`adult_${i}_dietary_notes`] : "";

        guests.push([
          new Date(),
          guestName,
          data.email,
          data.phone,
          data.busService || "no",
          "yes",
          "adult",
          dietary === "other" ? dietaryNotes : dietary,
        ]);
      }

      // Process children with menu
      const childCount = parseInt(data.numChildren) || 0;
      for (let i = 0; i < childCount; i++) {
        const guestName = data[`child_${i}_name`];
        const dietary = data[`child_${i}_dietary`];
        const dietaryNotes =
          dietary === "other" ? data[`child_${i}_dietary_notes`] : "";

        guests.push([
          new Date(),
          guestName,
          data.email,
          data.phone,
          data.busService || "no",
          "yes",
          "child",
          dietary === "other" ? dietaryNotes : dietary,
        ]);
      }

      // Process children without menu
      const noMenuCount = parseInt(data.numChildrenNoMenu) || 0;
      for (let i = 0; i < noMenuCount; i++) {
        const guestName = data[`nomenu_${i}_name`];

        guests.push([
          new Date(),
          guestName,
          data.email,
          data.phone,
          data.busService || "no",
          "yes",
          "no-menu",
          "",
        ]);
      }
    }

    // Add all guests to the sheet
    guests.forEach((guest) => sheet.appendRow(guest));

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
