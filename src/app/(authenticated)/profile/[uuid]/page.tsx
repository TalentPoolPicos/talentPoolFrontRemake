import ProfileView from '@/app/(authenticated)/profile/page';

type PageProps = {
  params: { uuid: string };
};

export default function PublicProfilePage({ params }: PageProps) {
  const { uuid } = params;
  return <ProfileView uuid={uuid} />;
}
