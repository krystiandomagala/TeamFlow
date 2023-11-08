import React from 'react';
import MainLayout from '../../layouts/MainLayout'
import Loading from '../common/Loading'
import useTeamExists from '../../hooks/useTeamExists';

export default function Chat() {
  const { isLoading } = useTeamExists();

  if (isLoading) {
    return <MainLayout><Loading/></MainLayout>;
  }

  return (
    <MainLayout>
      <div>Chat</div>
    </MainLayout>
  );
}
