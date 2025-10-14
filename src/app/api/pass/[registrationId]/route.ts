
import { generatePassImageFromComponent } from '@/lib/pass';

export const runtime = 'edge';

export async function GET(
    request: Request,
    { params }: { params: { registrationId: string } }
) {
    try {
        return await generatePassImageFromComponent(params.registrationId);
    } catch (e: any) {
        console.error(e);
        return new Response(`Failed to generate pass image: ${e.message}`, { status: 500 });
    }
}
