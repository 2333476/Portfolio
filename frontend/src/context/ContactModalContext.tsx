/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import ContactModal from '../components/ui/ContactModal';

interface ContactModalContextType {
    openContactModal: () => void;
    closeContactModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export function ContactModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openContactModal = () => setIsOpen(true);
    const closeContactModal = () => setIsOpen(false);

    return (
        <ContactModalContext.Provider value={{ openContactModal, closeContactModal }}>
            {children}
            <ContactModal isOpen={isOpen} onClose={closeContactModal} />
        </ContactModalContext.Provider>
    );
}

export function useContactModal() {
    const context = useContext(ContactModalContext);
    if (!context) {
        throw new Error('useContactModal must be used within a ContactModalProvider');
    }
    return context;
}
