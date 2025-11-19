import { withErrorHandling } from "../util/errors.js";
import { jsonResponse } from "../util/http";

async function downloadPdf(downloadUrl) {
  const resp = await fetch(downloadUrl);
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Failed to download PDF ${resp.status}: ${text.slice(0, 200)}`
    );
  }

  const arrayBuffer = await resp.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function uploadPdfToGhl(env, { pdfBytes, contactId, fieldId }) {
  if (!env.GHL_API_KEY) throw new Error("Missing GHL_API_KEY");
  if (!env.GHL_LOCATION_ID) throw new Error("Missing GHL_LOCATION_ID");

  const baseUrl = "https://services.leadconnectorhq.com";
  const qs = new URLSearchParams({
    contactId,
    locationId: env.GHL_LOCATION_ID,
  }).toString();
  const url = `${baseUrl}/contacts/forms/upload-custom-files${qs}`;

  // Build multipart/form-data
  const formData = new FormData();

  // Create a Blob from the PDF bytes
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  const fileName = "Test Document Upload";

  // "files" is the expected field name
  formData.append(fieldId, pdfBlob, fileName);

  // The file-upload custom field ID

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GHL_API_KEY}`,
      Version: "2021-07-28",
      // DO NOT set Content-Type here; fetch will do it for multipart/form-data
    },
    body: formData,
  });

  const text = await resp.text().catch(() => "");
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log("GHL upload-custom-files response", {
    status: resp.status,
    ok: resp.ok,
    data,
  });

  return {
    ok: resp.ok,
    status: resp.status,
    data,
  };
}

async function testUploadCore(request, env, ctx) {
  let body;
  /*   try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  } */

  const signedPdfUrl =
    "https://rabbitsign-docs.s3.amazonaws.com/Cash%20-%208723%20Leo%20Street%2C%20El%20Paso%20TX%2079904_ihmc5Wzvou72jfTvoojj5r.zip?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAgaCXVzLWVhc3QtMSJHMEUCIQCUNfeP1Cv9sLV2k2bH1KlWCTDexEuLd0uD10FgOr0znAIgF8of96oZ2XF2QTtwyE1tN4uPbjg58AhuxezdvmsYXdwq%2BQII0f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARADGgwzNDg1NTEyODM5NjUiDOYYsU%2BlUUAbyEzcoyrNAlzr0HSburpvFocbrhyZSl8Ve7ruOHnc1Sf7KFOuPrsjGp7mrJGnp28rR9h1NFxq%2B5SA8f49Hs4f%2B2DWB0NtZON7mabpmP2Vf2vDaZ80O4cHG32v3gfLQr3EVP3dCx4Hwv80rmkgDuQ2TkDqIttM3Zpgs15vL5C%2BzIbf6xZTbaS9IuYEZ3vBpZaiIysxIPlRG%2FXD0GCjayMp7jOlGYpJWcznqhy%2FQlIlBcoAzoS%2Bvq7S6jdxitKiDvwkzE7ISftr6cs3kLsovUUfE63RBXOVpLhWZ5WKm1etwOCFajZyk0wMSo7KptBLOkSBXpU9WBnWOu4BYlfsoJaSk7c43altxsUaqGcRrq5mpwonx3rZThyHF9ADLKmQfhk0O49a2TaL97jYXPmednMIG2X1zXXUwpDoXd20IwkonUTGXpX11X5yITus4OuiiAToOOr9NDC9ifTIBjqeAcmO4VEkt2gsJjWcPy7Ackucbfxmyal7sFB8REq8Y1tm5fQXQggubUg%2BETWIG1PqwNlRYNu6W9iK6Hvj8XdR3EkEktrCitzArA4XyVsEuwhqIojIpTSGjzzyRol%2FjjN8mL4bCF2nzlN6y5vodgZ3G2z%2FNKLE8MB0xuiYsrrKTRmJC5V09GHBvECTDmrB%2BrGtTT17mARues6avfdm5e98&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20251119T010201Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=ASIAVCJ2GQT6U3EKJ3GE%2F20251119%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3f38a06fe040fdbf4526ad259efcc853ecd05ef42046440158dab7c9a6267c07";
  const contactId = "69193caed2f1732f41482acc";
  const fieldId = "signed_pdf";

  if (!signedPdfUrl) {
    return jsonResponse({ ok: false, error: "Missing signedPdfUrl" }, 400);
  }
  if (!contactId) {
    return jsonResponse({ ok: false, error: "Missing contactId" }, 400);
  }
  if (!fieldId) {
    return jsonResponse({ ok: false, error: "Missing fieldId" }, 400);
  }

  // 1) Download the PDF
  const pdfBytes = await downloadPdf(signedPdfUrl);

  // 2) Upload to GHL
  const uploadResult = await uploadPdfToGhl(env, {
    pdfBytes,
    contactId,
    fieldId,
  });

  // 3) Return the full response so you can inspect structure in Postman
  return jsonResponse(
    {
      ok: uploadResult.ok,
      status: uploadResult.status,
      data: uploadResult.data,
    },
    uploadResult.ok ? 200 : 502
  );
}

// Export handler wrapped with error handling so you always get JSON
export const handleTestUpload = withErrorHandling(
  "test-worker-upload",
  testUploadCore,
  {
    swallowError: false,
    successStatus: 200,
  }
);
