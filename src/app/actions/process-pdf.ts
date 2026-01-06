"use server";

import PDFParser from "pdf2json";

export async function processPdf(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file uploaded" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF using pdf2json
    const pdfParser = new PDFParser(null, 1); // 1 = text content only

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) =>
        reject(errData.parserError)
      );
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        // Manually extract and decode text to ensure accuracy
        try {
          const rawText = pdfData.Pages.reduce((pageAcc: string, page: any) => {
            return (
              pageAcc +
              page.Texts.reduce((textAcc: string, text: any) => {
                return (
                  textAcc +
                  text.R.reduce((strAcc: string, run: any) => {
                    return strAcc + decodeURIComponent(run.T);
                  }, "") +
                  " "
                );
              }, "") +
              "\n"
            );
          }, "");
          resolve(rawText);
        } catch (e) {
          console.error("Error parsing PDF structure:", e);
          resolve(pdfParser.getRawTextContent()); // Fallback
        }
      });
      pdfParser.parseBuffer(buffer);
    });

    // Check if we actually got any text
    if (!text || text.trim().length === 0) {
      console.warn("PDF Extraction Result: [EMPTY]");
      return {
        error:
          "This PDF appears to be an image (scanned). Please use a PDF with selectable text (OCR).",
      };
    }

    const wacRegex = /WAC[- ]?[A-Z0-9]{3,}(?:-[A-Z0-9]+)*/gi;
    const matches = text.match(wacRegex) || [];
    const validCodes = matches.filter((code) => {
      const clean = code.trim().toUpperCase();
      return clean !== "WAC" && clean !== "WAC CODE";
    });

    const uniqueCodes = [...new Set(validCodes)];
    console.log("Found WAC Codes:", uniqueCodes);

    if (uniqueCodes.length === 0) {
      return {
        error:
          "No WAC codes found in the PDF. Ensure the PDF contains selectable text, not just images.",
      };
    }

    // Return codes directly without creating DB records yet
    return { success: true, codes: uniqueCodes };
  } catch (err) {
    console.error("PDF processing error:", err);
    return { error: "Failed to process PDF" };
  }
}
