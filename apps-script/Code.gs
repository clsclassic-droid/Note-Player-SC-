// Paste this file's contents into Extensions > Apps Script on the Google Sheet
// that lives inside the "Note-Player-SC-" Drive folder. See README.md for the
// full setup and deployment steps.

const SHEET_NAME = "NotePlayerData";
const HEADERS = ["Timestamp", "Player", "Race", "Strategy", "Manner"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const rows = values.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.toLowerCase()] = row[i];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  const sheet = getSheet_();
  const params = e.parameter;
  sheet.appendRow([
    new Date(),
    params.player || "",
    params.race || "",
    params.strategy || "",
    params.manner || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ result: "success" })
  ).setMimeType(ContentService.MimeType.JSON);
}
