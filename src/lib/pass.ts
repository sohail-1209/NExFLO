
"use server";

import type { Event, Registration } from './types';

// This function generates a pass image by using a third-party service (via a URL)
// to overlay text onto a base image. This is a common approach in serverless environments
// where local image manipulation libraries like 'canvas' may not be available or practical.
export async function generatePass(registration: Registration, event: Event): Promise<Buffer> {
  // Define the text overlays. Each object in the array represents one piece of text
  // to be drawn on the image. The `text` is encoded to be URL-safe.
  const overlays = [
    { text: encodeURIComponent(registration.studentName), x: event.nameX, y: event.nameY },
    { text: encodeURIComponent(registration.rollNumber), x: event.rollNumberX, y: event.rollNumberY },
    { text: encodeURIComponent(registration.branch), x: event.branchX, y: event.branchY },
    { text: encodeURIComponent(registration.studentEmail), x: event.emailX, y: event.emailY },
    { 
      text: encodeURIComponent(registration.status.charAt(0).toUpperCase() + registration.status.slice(1)), 
      x: event.statusX, 
      y: event.statusY 
    },
  ];

  // Construct the URL for the image generation service.
  // This example uses 'imgix.com', a popular image processing service.
  // The base URL is the pass layout image stored in Firebase Storage.
  // We append parameters to the URL to tell the service what to do.
  let imageUrl = `${event.passLayoutUrl}?`;

  // Define common text styling parameters.
  // These are specific to the 'imgix' service and control the font, size, color, etc.
  const textParams = `txt-color=000000&txt-font=Arial-Bold&txt-align=left&txt-size=24`;

  // Add each text overlay to the URL.
  // The 'blend' parameter tells imgix to overlay text, 'blend-x' and 'blend-y' set the position.
  overlays.forEach(overlay => {
    imageUrl += `&blend=${overlay.text}&blend-mode=normal&blend-x=${overlay.x}&blend-y=${overlay.y}&${textParams}`;
  });

  // The imgix service requires the base image URL to be Base64 encoded if it has its own parameters.
  // To simplify, we remove the token from our Firebase Storage URL. This may require storage rules
  // to be public for read access, which is a trade-off for using this method.
  const baseUrl = event.passLayoutUrl.split('?')[0];
  const encodedBaseUrl = Buffer.from(baseUrl).toString('base64url');
  
  // This is a hypothetical final URL structure for a different service that takes a base64 encoded base URL.
  // The actual implementation depends heavily on the chosen image manipulation service.
  // For this example, we will directly fetch the constructed URL which assumes the service
  // can handle chained parameters correctly.

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      // Log the URL for debugging purposes if the image fetch fails.
      console.error("Failed to fetch image from URL:", imageUrl);
      throw new Error(`Failed to generate pass image. Status: ${response.status}`);
    }
    // The response body is an ArrayBuffer, which we convert to a Buffer to be used in the email attachment.
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    return imageBuffer;
  } catch (error) {
    console.error("Error generating pass:", error);
    // If image generation fails, we re-throw the error to be handled by the calling action.
    throw new Error("Could not generate pass image.");
  }
}
