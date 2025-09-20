import ProfileView from '@/app/(authenticated)/profile/page';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <ProfileView uuid={uuid} />;
}
