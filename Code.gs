function doPost(e) {
  try {
    // Get specific spreadsheet by ID
    const SPREADSHEET_ID = "1ocpul7PDFJgtDJxN3gZnEW1Pxut5Xuq1VzMhr93vvnk";
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("rsvp_db");

    if (!sheet) {
      throw new Error("Sheet 'rsvp_db' not found");
    }

    const data = e.parameter;

    // Create backup first
    const now = new Date();
    const timestamp = Utilities.formatDate(now, "GMT", "MM-dd_HH:mm");
    const backupName = `RSVP_Backup_${timestamp}`;
    createBackup(SPREADSHEET_ID, backupName);

    // Array to store all guest entries
    let guests = [];
    let emailSummary = [];

    if (data.participation === "no") {
      // Single non-participating guest
      const guest = [
        now, // Timestamp
        data.fullName || "", // Name
        data.email, // Email
        data.phone, // Phone
        "no", // Bus
        "no", // Participates
        "", // MenuType
        "", // MenuDiet
      ];
      guests.push(guest);
      emailSummary.push(`${data.fullName} no podrá asistir`);
    } else {
      // Process all guests and build email summary
      const adultCount = parseInt(data.numAdults) || 0;
      const childCount = parseInt(data.numChildren) || 0;
      const noMenuCount = parseInt(data.numChildrenNoMenu) || 0;

      emailSummary.push(`Nueva confirmación de ${data.email} (${data.phone})`);
      emailSummary.push(
        `Servicio de autobús: ${data.busService === "yes" ? "Sí" : "No"}`
      );
      emailSummary.push(`\nInvitados:`);

      // Process each type of guest...
      // (existing guest processing code)

      // Add summary for email
      if (adultCount > 0) emailSummary.push(`\nAdultos:`);
      for (let i = 0; i < adultCount; i++) {
        const name = data[`adult_${i}_name`];
        const dietary = data[`adult_${i}_dietary`];
        const dietaryNotes =
          dietary === "other" ? data[`adult_${i}_dietary_notes`] : "";
        emailSummary.push(
          `- ${name} (${dietary}${dietaryNotes ? ": " + dietaryNotes : ""})`
        );
      }

      if (childCount > 0) emailSummary.push(`\nNiños con menú:`);
      // Similar for children...

      if (noMenuCount > 0) emailSummary.push(`\nNiños sin menú:`);
      // Similar for no-menu children...
    }

    // Add all guests to the sheet
    guests.forEach((guest) => sheet.appendRow(guest));

    // Send notification email
    sendNotificationEmail(emailSummary.join("\n"));

    return ContentService.createTextOutput("Success!");
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

function createBackup(spreadsheetId, backupName) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const backup = ss.copy(backupName);
}

function sendNotificationEmail(summary) {
  const emailAddress = "amira.e.david@gmail.com";
  const subject = "Nueva confirmación de asistencia";

  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    body: summary,
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
