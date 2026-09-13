/**
 * Parent portal's flow: phone-number lookup (stands in for the "phone
 * verified login" in the wireframe) returns the full dashboard payload
 * directly, which is then held in state and handed to ParentDashboard.
 */
import { useState } from 'react';
import ParentPhoneLogin from '../components/parent/ParentPhoneLogin';
import ParentDashboard from '../components/parent/ParentDashboard';
import type { ParentDashboard as DashboardData } from '../types/canonical';

export default function ParentPerspective() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  if (dashboardData) {
    return <ParentDashboard data={dashboardData} onLogout={() => setDashboardData(null)} />;
  }

  return <ParentPhoneLogin onSuccess={setDashboardData} />;
}