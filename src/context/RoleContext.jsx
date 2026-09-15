import { createContext, useContext, useState } from 'react';

const RoleContext = createContext(null);

/**
 * Provides the active role and a setter to the entire component tree.
 * Role is one of: 'Prospect' | 'Student' | 'Admin'
 */
export function RoleProvider({ children }) {
  const [role, setRole] = useState('Prospect');
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to consume the role context.
 * Must be used inside a <RoleProvider>.
 */
export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
}
