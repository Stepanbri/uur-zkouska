import LaunchIcon from '@mui/icons-material/Launch';
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    generateStagSyllabusUrl,
    generateCoursewareUrl,
    openInNewTab,
} from '../utils/externalLinksUtils';

/**
 * Komponenta pro zobrazení externích odkazů na STAG a Courseware
 * @param {Object} props
 * @param {Object} props.course - Objekt předmětu s departmentCode a courseCode
 * @param {string} props.direction - Směr stacku ('row' nebo 'column'), default 'row'
 * @param {string} props.size - Velikost tlačítek ('small', 'medium'), default 'small'
 * @param {boolean} props.compact - Kompaktní zobrazení bez textu, jen ikony, default false
 * @param {boolean} props.fullWidth - Rozložení tlačítek na celou šířku, default false
 */
const ExternalLinksComponent = ({
    course,
    direction = 'row',
    size = 'small',
    compact = false,
    fullWidth = false,
}) => {
    const { t, i18n } = useTranslation();

    if (!course || !course.departmentCode || !course.courseCode) {
        return null;
    }

    const currentLanguage = i18n.language?.split('-')[0] || 'cs';

    const handleStagClick = e => {
        e.stopPropagation();
        const url = generateStagSyllabusUrl(
            course.departmentCode,
            course.courseCode,
            currentLanguage
        );
        openInNewTab(url);
    };

    const handleCoursewareClick = e => {
        e.stopPropagation();
        const url = generateCoursewareUrl(course.departmentCode, course.courseCode);
        openInNewTab(url);
    };
    const buttonProps = {
        size,
        variant: 'outlined',
        onClick: handleStagClick,
        startIcon: <LaunchIcon fontSize="small" />,
        sx: {
            minWidth: compact ? 'auto' : undefined,
            px: compact ? 0.5 : undefined,
            py: compact ? 0.25 : undefined,
            fontSize: compact ? '0.6rem' : '0.75rem',
            textTransform: 'none',
            borderRadius: 1.5,
            fontWeight: 400,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
            },
            ...(fullWidth && { flex: 1 }),
        },
    };

    const coursewareButtonProps = {
        size,
        variant: 'outlined',
        onClick: handleCoursewareClick,
        startIcon: <LaunchIcon fontSize="small" />,
        sx: {
            minWidth: compact ? 'auto' : undefined,
            px: compact ? 0.5 : undefined,
            py: compact ? 0.25 : undefined,
            fontSize: compact ? '0.6rem' : '0.75rem',
            textTransform: 'none',
            borderRadius: 1.5,
            fontWeight: 400,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
                borderColor: 'secondary.main',
                bgcolor: 'action.hover',
            },
            ...(fullWidth && { flex: 1 }),
        },
    };
    return (
        <Box sx={{ mt: compact ? 0 : 1 }}>
            <Stack
                direction={direction}
                spacing={compact ? 0.25 : 0.5}
                alignItems={compact && direction === 'column' ? 'flex-end' : 'center'}
                sx={{
                    ...(fullWidth && direction === 'row' && { width: '100%' }),
                }}
            >
                <Button {...buttonProps}>
                    {compact
                        ? 'IS/STAG'
                        : t('externalLinks.stagSylabus', 'View syllabus in IS/STAG')}
                </Button>
                <Button {...coursewareButtonProps}>
                    {compact
                        ? 'COURSEWARE'
                        : t('externalLinks.courseware', 'Open in ZCU Courseware')}
                </Button>
            </Stack>
        </Box>
    );
};

export default ExternalLinksComponent;
