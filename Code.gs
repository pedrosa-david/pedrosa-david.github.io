function doPost(e) {
  try {
    console.log("Starting doPost execution");

    // Verify passkey
    const VALID_PASSKEY = "8X4nP9$mK2#jL5vQ"; // Must match the one in _config.yml
    if (e.parameter.passkey !== VALID_PASSKEY) {
      console.error("Invalid passkey received");
      throw new Error("Unauthorized access");
    }

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

    // After successfully adding guests to sheet
    // Send notification to admin
    sendNotificationEmail(data, guests);

    // Send calendar details to guest if email provided
    if (data.email) {
      sendEventDetails(data.email);
    }

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
  const PASSKEY = "8X4nP9$mK2#jL5vQ"; // Must match _config.yml

  // Simulate a "no" participation submission
  const noParticipationTest = {
    parameter: {
      passkey: PASSKEY,
      email: "pedrosa.c.david@gmail.com",
      phone: "34650180152",
      participation: "no",
      fullName: "Test User",
    },
  };

  // Simulate a "yes" participation submission with multiple guests
  const yesParticipationTest = {
    parameter: {
      passkey: PASSKEY,
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
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

function sendEventDetails(email) {
  if (!email) return; // Skip if no email provided

  console.log("Sending event details to:", email);

  const eventDetails = {
    to: email,
    from: "amira.e.david@gmail.com",
    subject: "Detalles de la Boda de Amira y David",
    body: `
¡Gracias por confirmar tu asistencia!

Aquí tienes los detalles del evento:

Evento: Boda Amira y David
Fecha: 23 de agosto de 2025
Lugar: Bodegas Buezo
Dirección: S/N Paraje Valdeazadín, 09228 Mahamud, Burgos, Spain
Google Maps: https://g.co/kgs/ttPhxS7

Guardaremos estos detalles en tu calendario.

¡Nos vemos pronto!
Amira y David
    `,
    htmlBody: `
<h2>¡Gracias por confirmar tu asistencia!</h2>

<p>Aquí tienes los detalles del evento:</p>

<ul>
  <li><strong>Evento:</strong> Boda Amira y David</li>
  <li><strong>Fecha:</strong> 23 de agosto de 2025</li>
  <li><strong>Lugar:</strong> Bodegas Buezo</li>
  <li><strong>Dirección:</strong> S/N Paraje Valdeazadín, 09228 Mahamud, Burgos, Spain</li>
  <li><strong>Google Maps:</strong> <a href="https://g.co/kgs/ttPhxS7">Ver ubicación</a></li>
</ul>

<p>Guardaremos estos detalles en tu calendario.</p>

<p>¡Nos vemos pronto!<br>
Amira y David</p>
    `,
    // Add calendar event
    attachments: [
      {
        fileName: "event.ics",
        content: createICSFile(),
        mimeType: "application/ics",
      },
    ],
  };

  MailApp.sendEmail(eventDetails);
  console.log("Event details sent successfully");
}

function createICSFile() {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:20250823
DTEND;VALUE=DATE:20250824
SUMMARY:Boda Amira y David
LOCATION:Bodegas Buezo, S/N Paraje Valdeazadín, 09228 Mahamud, Burgos, Spain
DESCRIPTION:Boda Amira y David en Bodegas Buezo\\nhttps://g.co/kgs/ttPhxS7
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

function sendNotificationEmail(data, guests) {
  const emailAddress = "amira.e.david@gmail.com";
  const subject = "Nueva confirmación de asistencia";

  let summary = [];
  summary.push(`Nueva confirmación recibida:`);
  summary.push(`Email: ${data.email || "No proporcionado"}`);
  summary.push(`Teléfono: ${data.phone}`);
  summary.push(
    `Servicio de autobús: ${data.busService === "yes" ? "Sí" : "No"}`
  );

  if (data.participation === "no") {
    summary.push(`\n${data.fullName} no podrá asistir`);
  } else {
    summary.push("\nInvitados:");
    guests.forEach((guest) => {
      summary.push(
        `- ${guest[1]} (${guest[6]}${guest[7] ? ": " + guest[7] : ""})`
      );
    });
  }

  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    body: summary.join("\n"),
  });
}

function runAllTests() {
  console.log("Starting all test cases...\n");

  // Run each test case
  testCase1_SingleAdultNoDiet();
  testCase2_CoupleWithDiet();
  testCase3_FamilyWithChildren();
  testCase4_LargeGroupWithBus();
  testCase5_NotAttending();
  testCase6_OnlyChildrenNoMenu();
  testCase7_MixedChildrenTypes();
  testCase8_ComplexDietaryNeeds();
  testCase9_MaximumGuests();
  testCase10_SingleAdultWithBus();

  console.log("\nAll test cases completed!");
}

function testCase1_SingleAdultNoDiet() {
  console.log("Test Case 1: Single Adult, No Dietary Requirements");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "no",
      numAdults: "1",
      numChildren: "0",
      numChildrenNoMenu: "0",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
    },
  };
  doPost(test);
}

function testCase2_CoupleWithDiet() {
  console.log("Test Case 2: Couple with Dietary Requirements");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "yes",
      numAdults: "2",
      numChildren: "0",
      numChildrenNoMenu: "0",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
      adult_1_name: "Maria García",
      adult_1_dietary: "vegetarian",
    },
  };
  doPost(test);
}

function testCase3_FamilyWithChildren() {
  console.log("Test Case 3: Family with Different Types of Children");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "yes",
      numAdults: "2",
      numChildren: "2",
      numChildrenNoMenu: "1",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
      adult_1_name: "Ana Martínez",
      adult_1_dietary: "none",
      child_0_name: "Lucas Pedrosa",
      child_0_dietary: "none",
      child_1_name: "Sara Pedrosa",
      child_1_dietary: "lactose-free",
      nomenu_0_name: "Emma Pedrosa",
    },
  };
  doPost(test);
}

function testCase4_LargeGroupWithBus() {
  console.log("Test Case 4: Large Group Using Bus Service");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "yes",
      numAdults: "6",
      numChildren: "0",
      numChildrenNoMenu: "0",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
      adult_1_name: "Carmen Ruiz",
      adult_1_dietary: "none",
      adult_2_name: "Juan Pérez",
      adult_2_dietary: "none",
      adult_3_name: "Laura Sánchez",
      adult_3_dietary: "vegetarian",
      adult_4_name: "Miguel Ángel López",
      adult_4_dietary: "none",
      adult_5_name: "Isabel García",
      adult_5_dietary: "gluten-free",
    },
  };
  doPost(test);
}

function testCase5_NotAttending() {
  console.log("Test Case 5: Not Attending");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "no",
      fullName: "David Pedrosa",
    },
  };
  doPost(test);
}

function testCase6_OnlyChildrenNoMenu() {
  console.log("Test Case 6: Parents with Only No-Menu Children");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "no",
      numAdults: "2",
      numChildren: "0",
      numChildrenNoMenu: "3",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
      adult_1_name: "Elena Rodríguez",
      adult_1_dietary: "none",
      nomenu_0_name: "Pablo Pedrosa",
      nomenu_1_name: "Lucía Pedrosa",
      nomenu_2_name: "Marco Pedrosa",
    },
  };
  doPost(test);
}

function testCase7_MixedChildrenTypes() {
  console.log("Test Case 7: Mixed Children Types with Dietary Requirements");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "yes",
      numAdults: "2",
      numChildren: "2",
      numChildrenNoMenu: "2",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
      adult_1_name: "Sofia Martín",
      adult_1_dietary: "vegan",
      child_0_name: "Daniel Pedrosa",
      child_0_dietary: "vegan",
      child_1_name: "Andrea Pedrosa",
      child_1_dietary: "other",
      child_1_dietary_notes: "Alergia a frutos secos",
      nomenu_0_name: "Leo Pedrosa",
      nomenu_1_name: "Alma Pedrosa",
    },
  };
  doPost(test);
}

function testCase8_ComplexDietaryNeeds() {
  console.log("Test Case 8: Group with Complex Dietary Requirements");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "no",
      numAdults: "4",
      numChildren: "1",
      numChildrenNoMenu: "0",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "vegetarian",
      adult_1_name: "Clara Jiménez",
      adult_1_dietary: "vegan",
      adult_2_name: "Roberto Núñez",
      adult_2_dietary: "other",
      adult_2_dietary_notes: "Alergia al pescado",
      adult_3_name: "Patricia Gómez",
      adult_3_dietary: "gluten-free",
      child_0_name: "Marina Pedrosa",
      child_0_dietary: "other",
      child_0_dietary_notes: "Intolerancia lactosa y huevo",
    },
  };
  doPost(test);
}

function testCase9_MaximumGuests() {
  console.log("Test Case 9: Maximum Number of Guests");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "yes",
      numAdults: "8",
      numChildren: "4",
      numChildrenNoMenu: "4",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
      adult_1_name: "María Fernández",
      adult_1_dietary: "none",
      adult_2_name: "José Luis García",
      adult_2_dietary: "none",
      adult_3_name: "Ana Belén Ruiz",
      adult_3_dietary: "vegetarian",
      adult_4_name: "Carlos Moreno",
      adult_4_dietary: "none",
      adult_5_name: "Laura Díaz",
      adult_5_dietary: "none",
      adult_6_name: "Alberto Sanz",
      adult_6_dietary: "gluten-free",
      adult_7_name: "Carmen Ortiz",
      adult_7_dietary: "none",
      child_0_name: "Pablo García",
      child_0_dietary: "none",
      child_1_name: "Lucía García",
      child_1_dietary: "none",
      child_2_name: "Mario Ruiz",
      child_2_dietary: "vegetarian",
      child_3_name: "Elena Ruiz",
      child_3_dietary: "none",
      nomenu_0_name: "Hugo Moreno",
      nomenu_1_name: "Julia Moreno",
      nomenu_2_name: "Leo Díaz",
      nomenu_3_name: "Vera Díaz",
    },
  };
  doPost(test);
}

function testCase10_SingleAdultWithBus() {
  console.log("Test Case 10: Single Adult Using Bus Service");
  const test = {
    parameter: {
      passkey: "8X4nP9$mK2#jL5vQ",
      email: "pedrosa.c.david@gmail.com",
      phonePrefix: "+34",
      phone: "650180152",
      participation: "yes",
      busService: "yes",
      numAdults: "1",
      numChildren: "0",
      numChildrenNoMenu: "0",
      adult_0_name: "David Pedrosa",
      adult_0_dietary: "none",
    },
  };
  doPost(test);
}
