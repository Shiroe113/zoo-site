// ===== НАЛАШТУВАННЯ =====
const TELEGRAM_TOKEN  = "ВСТАВТЕ_ВАШ_ТОКЕН";       // токен від @BotFather
const TELEGRAM_CHAT_ID = "ВСТАВТЕ_ВАШ_CHAT_ID";    // ваш chat_id
const SHEET_NAME = "Замовлення";                    // назва аркуша в таблиці

// ===== ОБРОБКА POST-запиту =====
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    saveToSheet(data);
    sendToTelegram(data);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== ЗАПИС У ТАБЛИЦЮ =====
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Створити аркуш із заголовками якщо його немає
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Дата", "Ім'я", "Email", "Телефон",
      "Товари", "Сума", "Коментар"
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.phone,
    data.items,
    data.total,
    data.comment || ""
  ]);
}

// ===== НАДСИЛАННЯ В TELEGRAM =====
function sendToTelegram(data) {
  const text =
    `🛒 <b>Нове замовлення!</b>\n\n` +
    `👤 <b>Ім'я:</b> ${data.name}\n` +
    `📞 <b>Телефон:</b> ${data.phone}\n` +
    `📧 <b>Email:</b> ${data.email}\n\n` +
    `📦 <b>Товари:</b>\n${data.items}\n\n` +
    `💰 <b>Разом:</b> ${data.total}\n` +
    (data.comment ? `💬 <b>Коментар:</b> ${data.comment}` : "");

  UrlFetchApp.fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: "HTML"
      })
    }
  );
}
