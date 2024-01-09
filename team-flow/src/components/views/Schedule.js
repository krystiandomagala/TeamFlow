import MainLayout from '../../layouts/MainLayout'
import React, { useState, useCallback } from 'react';
import Loading from '../common/Loading'
import useTeamExists from '../../hooks/useTeamExists';
import MyCalendar from '../common/MyCalendar';

export default function Schedule() {
  const { isLoading } = useTeamExists();



  if (isLoading) {
    return <MainLayout><Loading /></MainLayout>;
  }

  return (
    <MainLayout>
      <div className='my-3 w-100 d-flex flex-column'>
        <h1>Schedule</h1>
        <MyCalendar />
      </div>
    </MainLayout>
  );
}
