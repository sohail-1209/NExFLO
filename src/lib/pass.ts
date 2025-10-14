
"use server";

import { ImageResponse } from '@vercel/og';
import type { Event, Registration } from './types';
import EventPass from '@/components/EventPass';
import { getEventById, getRegistrationById } from './data';

export const config = {
  runtime: 'edge',
};

// This function generates the pass by rendering the EventPass component.
// It is intended to be called from an API route.
export async function generatePassImageFromComponent(registrationId: string) {
    const registration = await getRegistrationById(registrationId);
    if (!registration) {
      return new Response('Registration not found', { status: 404 });
    }
  
    const event = await getEventById(registration.eventId);
    if (!event) {
      return new Response('Event not found', { status: 404 });
    }

    const imageResponse = await generatePassImage(registration, event);
    
    const readableStream = imageResponse.body;
    if (!readableStream) {
        return new Response('Failed to generate image', { status: 500 });
    }

    // Create a new response from the readable stream
    return new Response(readableStream, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}


// This function contains the logic to render the component to an image.
export async function generatePassImage(registration: Registration, event: Event): Promise<ImageResponse> {

  // Note: We are using inline styles here because @vercel/og has limitations
  // with external stylesheets and complex Tailwind CSS classes.
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111827', // A dark background similar to the app's dark theme
          width: '100%',
          height: '100%',
        }}
      >
        <EventPass registration={registration} event={event} />
      </div>
    ),
    {
      width: 500,
      height: 700,
    }
  );
}
