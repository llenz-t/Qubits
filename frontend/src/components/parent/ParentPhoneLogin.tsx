/**
 * Parent "login": looks a parent up by phone number and, on success,
 * gets back the child's full dashboard payload in one call — no
 * separate dashboard fetch needed afterward (see parentLookup).
 */
import { useState, type FormEvent } from 'react';
import { UsersFour } from '@phosphor-icons/react';
import { parentLookup } from '../../lib/apiClient';
import type { ParentDashboard } from '../../types/canonical';

interface ParentPhoneLoginProps {
  onSuccess: (data: ParentDashboard) => void;
}

export default function ParentPhoneLogin({ onSuccess }: ParentPhoneLoginProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await parentLookup(phone);
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parent not found');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '3rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{marginBottom: '2rem'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              backgroundColor: '#8b5cf615',
              borderRadius: '0.75rem',
              fontSize: '1.5rem'
            }}>
              <UsersFour size={24} weight="duotone" color="#8b5cf6" />
            </div>
            <h2 style={{fontSize: '1.875rem', fontWeight: '700', color: '#0f172a'}}>
              Parent Portal
            </h2>
          </div>
          <p style={{fontSize: '1rem', color: '#64748b', lineHeight: '1.6'}}>
            Enter your registered phone number to view your child's attendance records.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '0.5rem'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="012-345-6789"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#991b1b',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              backgroundColor: loading ? '#94a3b8' : '#8b5cf6',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#7c3aed';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#8b5cf6';
            }}
          >
            {loading ? 'Looking up...' : 'View Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}