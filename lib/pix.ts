// Geração de BR Code Pix real (padrão EMV do Banco Central)
// Usado tanto pelo checkout público quanto pela criação manual de pedidos no admin.

function sanitizeForPix(text: string, maxLen: number) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "") // só letras, números e espaço
    .trim()
    .slice(0, maxLen);
}

function tlv(id: string, value: string) {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

// CRC16-CCITT (polinômio 0x1021), exigido pelo padrão do Banco Central
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(orderCode: string, total: number) {
  const pixKey = process.env.PIX_KEY;
  const merchantNameRaw = process.env.PIX_MERCHANT_NAME;
  const merchantCityRaw = process.env.PIX_MERCHANT_CITY;

  if (!pixKey || !merchantNameRaw || !merchantCityRaw) {
    throw new Error(
      "Configuração do Pix incompleta: verifique PIX_KEY, PIX_MERCHANT_NAME e PIX_MERCHANT_CITY nas variáveis de ambiente da Vercel."
    );
  }

  const merchantName = sanitizeForPix(merchantNameRaw, 25);
  const merchantCity = sanitizeForPix(merchantCityRaw, 15);
  const txid = orderCode.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);

  const merchantAccountInfo = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", pixKey);
  const additionalData = tlv("05", txid);

  const payload =
    tlv("00", "01") +
    tlv("26", merchantAccountInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", total.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity) +
    tlv("62", additionalData) +
    "6304";

  return payload + crc16(payload);
}
