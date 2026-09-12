/**
 * Demo staff-ID login for the SSD Admin / Staff portal.
 *
 * This app has no real backend authentication anywhere (student login is
 * email+roll, parent login is a simulated OTP) - this replaces the old
 * "type the passcode admin" flow with a small allow-list of demo Staff IDs,
 * so the Staff portal is entered the same way the user asked for: "staff
 * with specific id".
 */

export interface DemoStaffAccount {
  staffId: string;
  name: string;
  role: string;
}

export const DEMO_STAFF_ACCOUNTS: DemoStaffAccount[] = [
  { staffId: 'SSD-ADMIN-01', name: 'Bimala Shrestha', role: 'SSD Administrator' },
  { staffId: 'SSD-STAFF-07', name: 'Prakash Rai', role: 'Student Services Officer' },
];

export function normalizeStaffId(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidStaffId(input: string): boolean {
  const id = normalizeStaffId(input);
  if (!id) return false;
  return DEMO_STAFF_ACCOUNTS.some((account) => account.staffId === id);
}

export function findStaffAccount(input: string): DemoStaffAccount | undefined {
  const id = normalizeStaffId(input);
  return DEMO_STAFF_ACCOUNTS.find((account) => account.staffId === id);
}
