
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

    const { readable, writable } = new TransformStream();
    const imageResponse = generatePassImage(registration, event);
    imageResponse.then(res => res.body?.pipeTo(writable));
    return new Response(readable, {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}


// This function contains the logic to render the component to an image.
export async function generatePassImage(registration: Registration, event: Event): Promise<ImageResponse> {
  const qrData = JSON.stringify({
    registrationId: registration.id,
    studentName: registration.studentName,
    studentEmail: registration.studentEmail,
    rollNumber: registration.rollNumber,
    eventId: event.id
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=111827&color=ffffff`;

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
