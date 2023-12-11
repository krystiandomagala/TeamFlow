import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Loading from '../common/Loading'
import useTeamExists from '../../hooks/useTeamExists';
import { useUserTeamData } from '../../contexts/TeamContext';

export default function Team() {
  const { isLoading } = useTeamExists();
  const { getTeamData } = useUserTeamData()
  const { teamId } = useTeamExists()
  const [accessCode, setAccessCode] = useState('')

  useEffect(() => {
    getTeamData(teamId).then((data) => setAccessCode(data.accessCode))
  }, [teamId])


  if (isLoading) {
    return <MainLayout><Loading /></MainLayout>;
  }

  return (
    <MainLayout>
      access code: {accessCode}
    </MainLayout>
  );
}
