import React from 'react';
import { StudentLoginModal } from './auth/StudentLoginModal';
import { CanonicalStudent } from '../types/canonical';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (email: string, student?: CanonicalStudent) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  return (
    <StudentLoginModal
      isOpen={isOpen}
      onClose={onClose}
      onLoginSuccess={(student) => {
        if (onLoginSuccess) {
          onLoginSuccess(student.email, student);
        }
        onClose();
      }}
    />
  );
};
