/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import ContactModal from '../components/ui/ContactModal';

interface ContactModalContextType {
    isContactModalOpen: boolean;
    isTestimonialModalOpen: boolean;
    isWorkModalOpen: boolean;
    openContactModal: () => void;
    closeContactModal: () => void;
    setTestimonialModalOpen: (isOpen: boolean) => void;
    setWorkModalOpen: (isOpen: boolean) => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export function ContactModalProvider({ children }: { children: ReactNode }) {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);
    const [isWorkOpen, setIsWorkOpen] = useState(false);

    const openContactModal = () => setIsContactOpen(true);
    const closeContactModal = () => setIsContactOpen(false);
    const setTestimonialModalOpen = (open: boolean) => setIsTestimonialOpen(open);
    const setWorkModalOpen = (open: boolean) => setIsWorkOpen(open);

    return (
        <ContactModalContext.Provider value={{
            isContactModalOpen: isContactOpen,
            isTestimonialModalOpen: isTestimonialOpen,
            isWorkModalOpen: isWorkOpen,
            openContactModal,
            closeContactModal,
            setTestimonialModalOpen,
            setWorkModalOpen
        }}>
            {children}
            <ContactModal isOpen={isContactOpen} onClose={closeContactModal} />
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
