import MainLayout from '../../layouts/MainLayout'
import React from 'react';
import Loading from '../common/Loading'
import useTeamExists from '../../hooks/useTeamExists';


export default function Schedule() {
  const { isLoading } = useTeamExists();

  if (isLoading) {
    return <MainLayout><Loading/></MainLayout>;
  }

  return (
    <MainLayout>
      <div>Schedule</div>
    </MainLayout>
  );
}