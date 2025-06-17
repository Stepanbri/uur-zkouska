/**
 * Utility funkce pro generování externích odkazů na STAG a Courseware
 */

import { getCurrentAcademicYear } from './academicYearUtils';

/**
 * Generuje URL pro STAG sylabus předmětu
 * @param {string} departmentCode - Zkratka katedry/pracoviště (např. "KIV")
 * @param {string} courseCode - Zkratka předmětu (např. "PPA1")
 * @param {string} language - Jazyk (cs/en), default 'cs'
 * @param {string} year - Akademický rok (např. "2024"), default aktuální rok
 * @returns {string} URL pro STAG sylabus
 */
export const generateStagSyllabusUrl = (departmentCode, courseCode, language = 'cs', year = null) => {
    if (!departmentCode || !courseCode) {
        console.warn('generateStagSyllabusUrl: Missing required parameters', { departmentCode, courseCode });
        return '';
    }

    // Použijeme aktuální akademický rok pokud není specifikován
    const academicYear = year || getCurrentAcademicYear().split('/')[0];
    
    // STAG podporuje pouze cs a en
    const stagLanguage = ['cs', 'en'].includes(language) ? language : 'cs';

    const baseUrl = 'https://portal.zcu.cz/StagPortletsJSR168/CleanUrl';
    const params = new URLSearchParams({
        urlid: 'prohlizeni-predmet-sylabus',
        predmetZkrPrac: departmentCode.trim().toUpperCase(),
        predmetZkrPred: courseCode.trim().toUpperCase(),
        predmetRok: academicYear,
        plang: stagLanguage
    });

    return `${baseUrl}?${params.toString()}`;
};

/**
 * Generuje URL pro ZČU Courseware předmětu
 * @param {string} departmentCode - Zkratka katedry/pracoviště (např. "KIV")
 * @param {string} courseCode - Zkratka předmětu (např. "PPA1")
 * @returns {string} URL pro Courseware
 */
export const generateCoursewareUrl = (departmentCode, courseCode) => {
    if (!departmentCode || !courseCode) {
        console.warn('generateCoursewareUrl: Missing required parameters', { departmentCode, courseCode });
        return '';
    }

    const baseUrl = 'https://courseware.zcu.cz/predmety';
    const department = departmentCode.trim().toLowerCase();
    const course = courseCode.trim().toLowerCase();

    return `${baseUrl}/${department}/${course}`;
};

/**
 * Otevře URL v novém tabu/okně
 * @param {string} url - URL k otevření
 */
export const openInNewTab = (url) => {
    if (!url) {
        console.warn('openInNewTab: No URL provided');
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
};
