import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStagApi } from './StagApiContext';
import hierarchyManager from '../services/HierarchyManager';

const HierarchyContext = createContext();

export const useHierarchy = () => {
    const context = useContext(HierarchyContext);
    if (!context) {
        throw new Error('useHierarchy must be used within a HierarchyProvider');
    }
    return context;
};

export const HierarchyProvider = ({ children }) => {
    const { stagApiService } = useStagApi();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Načtení hierarchie při startu aplikace
    useEffect(() => {
        if (!stagApiService || isLoaded || isLoading) return;

        const loadHierarchy = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Získáme aktuální jazyk z i18n pokud je k dispozici
                const language = localStorage.getItem('i18nextLng') || 'cs';
                const success = await hierarchyManager.loadHierarchy(stagApiService, language);
                
                if (success) {
                    setIsLoaded(true);
                    console.log('Hierarchy loaded successfully in context');
                } else {
                    throw new Error('Failed to load hierarchy');
                }
            } catch (err) {
                console.error('Error loading hierarchy in context:', err);
                setError(err.message || 'Failed to load workplace hierarchy');
            } finally {
                setIsLoading(false);
            }
        };

        loadHierarchy();
    }, [stagApiService, isLoaded, isLoading]);

    // Funkce pro ruční obnovení hierarchie
    const reloadHierarchy = async () => {
        hierarchyManager.reset();
        setIsLoaded(false);
        setError(null);
        
        if (stagApiService) {
            setIsLoading(true);
            try {
                const language = localStorage.getItem('i18nextLng') || 'cs';
                const success = await hierarchyManager.loadHierarchy(stagApiService, language);
                
                if (success) {
                    setIsLoaded(true);
                } else {
                    throw new Error('Failed to reload hierarchy');
                }
            } catch (err) {
                console.error('Error reloading hierarchy:', err);
                setError(err.message || 'Failed to reload workplace hierarchy');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Získání hierarchické struktury pro kurzy
    const getHierarchicalStructure = (courses) => {
        if (!isLoaded) return {};
        return hierarchyManager.getHierarchicalStructure(courses);
    };

    // Získání fakulty pro katedru
    const getFacultyForDepartment = (departmentCode) => {
        if (!isLoaded) return null;
        return hierarchyManager.getFacultyForDepartment(departmentCode);
    };

    // Získání všech kateder pro fakultu
    const getDepartmentsForFaculty = (facultyCode) => {
        if (!isLoaded) return [];
        return hierarchyManager.getDepartmentsForFaculty(facultyCode);
    };

    const contextValue = {
        isLoading,
        isLoaded,
        error,
        hierarchyManager,
        reloadHierarchy,
        getHierarchicalStructure,
        getFacultyForDepartment,
        getDepartmentsForFaculty,
    };

    return (
        <HierarchyContext.Provider value={contextValue}>
            {children}
        </HierarchyContext.Provider>
    );
};
