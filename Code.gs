function doPost(e) {
  try {
    console.log("Starting doPost execution");
    console.log("Request parameters:", e.parameter);

    const sheet = SpreadsheetApp.openById(
      "1ocpul7PDFJgtDJxN3gZnEW1Pxut5Xuq1VzMhr93vvnk"
    ).getSheetByName("confirmations");
    console.log("Sheet accessed successfully");

    const data = e.parameter;
    let guests = [];

    // Format timestamp for sheet entries
    const now = new Date();
    const madridTime = Utilities.formatDate(
      now,
      "Europe/Madrid",
      "MM/dd/yyyy HH:mm:ss"
    );
    const timestamp_entry = new Date(madridTime);
    console.log("Timestamp created:", madridTime);

    if (data.participation === "no") {
      console.log("Processing non-participating guest");
      guests.push([
        timestamp_entry,
        data.fullName || "",
        data.email,
        data.phone,
        "no",
        "no",
        "",
        "",
      ]);
    } else {
      console.log("Processing participating guests");

      // Process adult guests
      const adultCount = parseInt(data.numAdults) || 0;
      console.log(`Processing ${adultCount} adult guests`);
      for (let i = 0; i < adultCount; i++) {
        const guestName = data[`adult_${i}_name`];
        const dietary = data[`adult_${i}_dietary`];
        const dietaryNotes =
          dietary === "other" ? data[`adult_${i}_dietary_notes`] : "";
        console.log(`Adult ${i + 1}:`, guestName, dietary, dietaryNotes);

        guests.push([
          timestamp_entry,
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
      console.log(`Processing ${childCount} children with menu`);
      for (let i = 0; i < childCount; i++) {
        const guestName = data[`child_${i}_name`];
        const dietary = data[`child_${i}_dietary`];
        const dietaryNotes =
          dietary === "other" ? data[`child_${i}_dietary_notes`] : "";
        console.log(`Child ${i + 1}:`, guestName, dietary, dietaryNotes);

        guests.push([
          timestamp_entry,
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
      console.log(`Processing ${noMenuCount} children without menu`);
      for (let i = 0; i < noMenuCount; i++) {
        const guestName = data[`nomenu_${i}_name`];
        console.log(`Child no menu ${i + 1}:`, guestName);

        guests.push([
          timestamp_entry,
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

    console.log("Adding guests to sheet:", guests);
    guests.forEach((guest) => sheet.appendRow(guest));
    console.log("Guests added successfully");

    // Create backup
    const timestamp = Utilities.formatDate(now, "Europe/Madrid", "MM-dd_HH:mm");
    const backupName = `RSVP_Backup_${timestamp}`;
    console.log("Creating backup:", backupName);
    createBackup(backupName);
    console.log("Backup created successfully");

    return ContentService.createTextOutput("Success!");
  } catch (error) {
    console.error("Error in doPost:", error);
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

function createBackup(backupName) {
  console.log("Starting backup creation");
  try {
    const BACKUP_FOLDER_ID = "1WupHZwA6lsN_RDvpkukZ82IqFx0rvGgQ";
    const ss = SpreadsheetApp.openById(
      "1ocpul7PDFJgtDJxN3gZnEW1Pxut5Xuq1VzMhr93vvnk"
    );
    console.log("Source spreadsheet accessed");

    const backup = ss.copy(backupName);
    console.log("Backup copy created:", backup.getId());

    const backupFile = DriveApp.getFileById(backup.getId());
    const backupFolder = DriveApp.getFolderById(BACKUP_FOLDER_ID);
    console.log("Moving backup to folder:", BACKUP_FOLDER_ID);

    backupFolder.addFile(backupFile);
    DriveApp.getRootFolder().removeFile(backupFile);
    console.log("Backup moved successfully");
  } catch (error) {
    console.error("Error in createBackup:", error);
    throw error;
  }
}

function testDoPost() {
  // Simulate a "no" participation submission
  const noParticipationTest = {
    parameter: {
      email: "test@example.com",
      phone: "34650123456",
      participation: "no",
      fullName: "Test User",
    },
  };

  // Simulate a "yes" participation submission with multiple guests
  const yesParticipationTest = {
    parameter: {
      email: "test@example.com",
      phonePrefix: "+34",
      phone: "650123456",
      participation: "yes",
      busService: "yes",
      numAdults: "2",
      numChildren: "1",
      numChildrenNoMenu: "1",
      adult_0_name: "Adult One",
      adult_0_dietary: "vegetarian",
      adult_1_name: "Adult Two",
      adult_1_dietary: "other",
      adult_1_dietary_notes: "Allergic to nuts",
      child_0_name: "Child One",
      child_0_dietary: "none",
      nomenu_0_name: "Baby One",
    },
  };

  console.log("Testing NO participation submission:");
  doPost(noParticipationTest);

  console.log("\nTesting YES participation submission:");
  doPost(yesParticipationTest);
}

function testSingleAdult() {
  const test = {
    parameter: {
      email: "test@example.com",
      phonePrefix: "+34",
      phone: "650123456",
      participation: "yes",
      busService: "yes",
      numAdults: "1",
      numChildren: "0",
      numChildrenNoMenu: "0",
      adult_0_name: "Single Adult Test",
      adult_0_dietary: "none",
    },
  };

  console.log("Testing single adult submission:");
  doPost(test);
}

function testComplexDietary() {
  const test = {
    parameter: {
      email: "test@example.com",
      phonePrefix: "+34",
      phone: "650123456",
      participation: "yes",
      busService: "no",
      numAdults: "2",
      numChildren: "0",
      numChildrenNoMenu: "0",
      adult_0_name: "Vegan Adult",
      adult_0_dietary: "vegan",
      adult_1_name: "Complex Diet Adult",
      adult_1_dietary: "other",
      adult_1_dietary_notes: "Gluten free and no seafood",
    },
  };

  console.log("Testing complex dietary requirements:");
  doPost(test);
}
