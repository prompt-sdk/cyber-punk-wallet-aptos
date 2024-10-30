import { cookies } from 'next/headers';

import { Tool } from '@/components/custom/tool';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { auth } from '@/app/(auth)/auth';
import { notFound } from 'next/navigation';

export default async function Page() {

  const cookieStore = await cookies();
  const value = cookieStore.get('model')?.value;
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;

  const session = await auth();
  if (!session || !session.user) {
    return notFound();
  }
  return (
    <Tool
      selectedModelName={selectedModelName}
      session={session}
    />
  );
}
