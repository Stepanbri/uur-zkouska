import LaunchIcon from '@mui/icons-material/Launch';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generateStagSyllabusUrl, generateCoursewareUrl, openInNewTab } from '../utils/externalLinksUtils';

/**
 * Komponenta pro zobrazení externích odkazů na STAG a Courseware
 * @param {Object} props
 * @param {Object} props.course - Objekt předmětu s departmentCode a courseCode
 * @param {string} props.direction - Směr stacku ('row' nebo 'column'), default 'row'
 * @param {string} props.size - Velikost tlačítek ('small', 'medium'), default 'small'
 * @param {boolean} props.compact - Kompaktní zobrazení bez textu, jen ikony, default false
 */
const ExternalLinksComponent = ({ 
    course, 
    direction = 'row', 
    size = 'small', 
    compact = false 
}) => {
    const { t, i18n } = useTranslation();

    if (!course || !course.departmentCode || !course.courseCode) {
        return null;
    }

    const currentLanguage = i18n.language?.split('-')[0] || 'cs';

    const handleStagClick = (e) => {
        e.stopPropagation();
        const url = generateStagSyllabusUrl(
            course.departmentCode, 
            course.courseCode, 
            currentLanguage
        );
        openInNewTab(url);
    };

    const handleCoursewareClick = (e) => {
        e.stopPropagation();
        const url = generateCoursewareUrl(
            course.departmentCode, 
            course.courseCode
        );
        openInNewTab(url);
    };

    const buttonProps = {
        size,
        variant: 'outlined',
        onClick: handleStagClick,
        startIcon: compact ? null : <LaunchIcon fontSize="small" />,
        sx: {
            minWidth: compact ? 'auto' : undefined,
            px: compact ? 1 : undefined,
            fontSize: '0.75rem',
            textTransform: 'none',
        }
    };

    const coursewareButtonProps = {
        size,
        variant: 'outlined', 
        onClick: handleCoursewareClick,
        startIcon: compact ? null : <SchoolIcon fontSize="small" />,
        sx: {
            minWidth: compact ? 'auto' : undefined,
            px: compact ? 1 : undefined,
            fontSize: '0.75rem',
            textTransform: 'none',
        }
    };

    return (
        <Box sx={{ mt: 1 }}>
            <Stack direction={direction} spacing={0.5} alignItems="center">
                <Button {...buttonProps}>
                    {compact ? <LaunchIcon fontSize="small" /> : t('externalLinks.stagSylabus', 'View syllabus in IS/STAG')}
                </Button>
                <Button {...coursewareButtonProps}>
                    {compact ? <SchoolIcon fontSize="small" /> : t('externalLinks.courseware', 'Open in ZCU Courseware')}
                </Button>
            </Stack>
        </Box>
    );
};

export default ExternalLinksComponent;
