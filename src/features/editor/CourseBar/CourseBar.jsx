import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import { alpha, Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EVENT_TYPE_TO_KEY_MAP } from '../../../services/CourseClass';
import { useHierarchy } from '../../../contexts/HierarchyContext';
import CourseNodeHeader from './CourseNodeHeader';
import EventNode from './EventNode';

function CourseBar({
    courses,
    activeSchedule,
    onRemoveCourse,
    onToggleEvent,
    isLoading = false,
    onOpenLoadCourseFromSTAGDialog,
    onOpenLoadCoursesFromStudentDialog,
    onRemoveAllCourses, // Nová prop
}) {
    const { t } = useTranslation();
    const { getHierarchicalStructure, isLoaded: isHierarchyLoaded } = useHierarchy();
    const [expandedItems, setExpandedItems] = useState([]);

    const handleExpandedItemsChange = (event, itemIds) => {
        setExpandedItems(itemIds);
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    p: 2,
                }}
            >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>{t('labels.loadingCourses')}</Typography>
            </Box>
        );
    }

    let enrolledEventIds = new Set();
    if (activeSchedule && typeof activeSchedule.getAllEnrolledEvents === 'function') {
        const eventsList = activeSchedule.getAllEnrolledEvents() || [];
        enrolledEventIds = new Set(eventsList.map(e => e.id));
    } else if (activeSchedule) {
        console.warn(
            'CourseBar: activeSchedule is present but getAllEnrolledEvents is not a function. Received:',
            activeSchedule
        );
    }

    // Získání hierarchické struktury fakult -> katedr -> kurzů
    const hierarchicalStructure = isHierarchyLoaded ? getHierarchicalStructure(courses || []) : {}; // Fallback pro případ, že hierarchie není načtena
    const coursesByDepartment = courses
        ? courses.reduce((acc, course) => {
              const dept = course.departmentCode || t('labels.unknownDepartment');
              if (!acc[dept]) {
                  acc[dept] = {
                      courses: [],
                      name: course.departmentName || dept, // Pokusíme se získat plný název katedry
                  };
              }
              acc[dept].courses.push(course);
              return acc;
          }, {})
        : {};

    const useHierarchicalView = isHierarchyLoaded && Object.keys(hierarchicalStructure).length > 0;

    const getItemId = (prefix, id) => `${prefix}-${id}`; // Render pro hierarchické zobrazení
    const renderHierarchicalView = () => {
        return Object.entries(hierarchicalStructure).map(([facultyCode, facultyData]) => (
            <TreeItem
                key={getItemId('faculty', facultyCode)}
                itemId={getItemId('faculty', facultyCode)}
                label={
                    <Tooltip title={`${facultyCode} ${facultyData.name}`} placement="right">
                        {' '}
                        <Typography
                            sx={{
                                fontSize: '0.95rem',
                                py: '6px',
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                cursor: 'pointer',
                            }}
                        >
                            <Box component="span" sx={{ fontWeight: 700 }}>
                                {facultyCode}
                            </Box>
                            <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>
                                {facultyData.name}
                            </Box>
                        </Typography>
                    </Tooltip>
                }
                sx={{
                    '& > .MuiTreeItem-content': {
                        py: '4px',
                        '&:hover': {
                            backgroundColor: theme => alpha(theme.palette.action.hover, 0.06),
                        },
                    },
                }}
            >
                {Object.entries(facultyData.departments).map(([departmentCode, departmentData]) => (
                    <TreeItem
                        key={getItemId('dept', departmentCode)}
                        itemId={getItemId('dept', departmentCode)}
                        label={
                            <Tooltip
                                title={`${departmentCode} ${departmentData.name || departmentCode}`}
                                placement="right"
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem', // Středně velký font pro katedry
                                        py: '4px',
                                        color: 'text.primary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Box component="span" sx={{ fontWeight: 650 }}>
                                        {departmentCode}
                                    </Box>
                                    <Box
                                        component="span"
                                        sx={{ fontWeight: 400, color: 'text.secondary' }}
                                    >
                                        {departmentData.name || departmentCode}
                                    </Box>
                                </Typography>
                            </Tooltip>
                        }
                        sx={{
                            '& > .MuiTreeItem-content': {
                                py: '2px',
                                '&:hover': {
                                    backgroundColor: theme =>
                                        alpha(theme.palette.action.hover, 0.04),
                                },
                            },
                        }}
                    >
                        {departmentData.courses.map(course => renderCourseItem(course))}
                    </TreeItem>
                ))}
            </TreeItem>
        ));
    }; // Render function pro klasické zobrazení podle katedr
    const renderDepartmentalView = () => {
        return Object.entries(coursesByDepartment).map(([departmentCode, deptData]) => (
            <TreeItem
                key={getItemId('dept', departmentCode)}
                itemId={getItemId('dept', departmentCode)}
                label={
                    <Tooltip title={`${departmentCode} ${deptData.name}`} placement="right">
                        {' '}
                        <Typography
                            sx={{
                                fontSize: '0.875rem', // Středně velký font pro katedry
                                py: '4px',
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                cursor: 'pointer',
                            }}
                        >
                            <Box component="span" sx={{ fontWeight: 650 }}>
                                {departmentCode}
                            </Box>{' '}
                            {/* Mírně tučnější */}
                            <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>
                                {deptData.name}
                            </Box>
                        </Typography>
                    </Tooltip>
                }
                sx={{
                    '& > .MuiTreeItem-content': {
                        py: '2px',
                        '&:hover': {
                            backgroundColor: theme => alpha(theme.palette.action.hover, 0.04),
                        },
                    },
                }}
            >
                {deptData.courses.map(course => renderCourseItem(course))}
            </TreeItem>
        ));
    };

    // Společná render funkce pro kurz a jeho eventy
    const renderCourseItem = course => {
        const courseItemId = getItemId('course', course.id);
        const isCourseExpanded = expandedItems.includes(courseItemId);
        const enrolledHours = course.getEnrolledHours(enrolledEventIds);
        const areAllReqsMet = course.areAllEnrollmentRequirementsMet(enrolledEventIds);

        return (
            <TreeItem
                key={courseItemId}
                itemId={courseItemId}
                label={
                    <CourseNodeHeader
                        course={course}
                        enrolledHours={enrolledHours}
                        areAllRequirementsMet={areAllReqsMet}
                        onRemoveCourse={onRemoveCourse}
                        isExpanded={isCourseExpanded}
                    />
                }
                sx={{
                    '& > .MuiTreeItem-content': {
                        py: '1px',
                        '&:hover': {
                            bgcolor: theme => alpha(theme.palette.action.hover, 0.08),
                        },
                    },
                    '& > .MuiTreeItem-content.Mui-focused, & > .MuiTreeItem-content.Mui-selected, & > .MuiTreeItem-content.Mui-selected.Mui-focused':
                        {
                            backgroundColor: theme => alpha(theme.palette.primary.main, 0.12),
                        },
                }}
            >
                {course.events && course.events.length > 0 ? (
                    [...course.events]
                        .sort((a, b) => {
                            const typeOrder = {
                                PŘEDNÁŠKA: 1,
                                CVIČENÍ: 2,
                                SEMINÁŘ: 3,
                            };
                            const typeA = typeOrder[a.type.toUpperCase()] || 99;
                            const typeB = typeOrder[b.type.toUpperCase()] || 99;

                            if (typeA !== typeB) {
                                return typeA - typeB;
                            }

                            if (a.day !== b.day) {
                                return a.day - b.day;
                            }

                            const timeA = a.startTime.split(':').map(Number);
                            const timeB = b.startTime.split(':').map(Number);
                            return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                        })
                        .map(event => {
                            const isEnrolled = enrolledEventIds.has(event.id);
                            const normalizedEventType = event.type?.toLowerCase() || '';
                            const eventTypeKey =
                                EVENT_TYPE_TO_KEY_MAP[normalizedEventType] || normalizedEventType;
                            const typeRequirementMetForCourse =
                                course.isEnrollmentTypeRequirementMet(
                                    eventTypeKey,
                                    enrolledEventIds
                                );
                            let canEnroll = true;
                            let disabledTooltipText = '';

                            if (typeRequirementMetForCourse && !isEnrolled) {
                                canEnroll = false;
                                disabledTooltipText = t('tooltips.enrollDisabledTypeMet', {
                                    eventType: t(`courseEvent.${eventTypeKey}`, event.type),
                                });
                            }

                            return (
                                <TreeItem
                                    key={getItemId('event', event.id)}
                                    itemId={getItemId('event', event.id)}
                                    label={
                                        <EventNode
                                            event={event}
                                            isEnrolled={isEnrolled}
                                            onToggleEvent={onToggleEvent}
                                            canEnroll={isEnrolled ? true : canEnroll}
                                            disabledTooltipText={disabledTooltipText}
                                        />
                                    }
                                    sx={{
                                        '& > .MuiTreeItem-content': {
                                            p: '2px 0',
                                            width: '100%',
                                            cursor: 'default',
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                            },
                                        },
                                        '& > .MuiTreeItem-content.Mui-focused, & > .MuiTreeItem-content.Mui-selected, & > .MuiTreeItem-content.Mui-selected.Mui-focused':
                                            {
                                                backgroundColor: 'transparent',
                                            },
                                        '& .MuiTreeItem-label': {
                                            width: '100%',
                                            p: 0,
                                            m: 0,
                                        },
                                    }}
                                />
                            );
                        })
                ) : (
                    <Typography
                        sx={{
                            fontStyle: 'italic',
                            p: '8px 16px',
                            fontSize: '0.8rem',
                            color: 'text.disabled',
                        }}
                    >
                        {t('labels.noEventsForCourse')}
                    </Typography>
                )}
            </TreeItem>
        );
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: { xs: 1, sm: 2 },
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{ px: { xs: 2, sm: 1 }, mb: 1 }}
            >
                {t('courseBar.title', 'Předměty')}
            </Typography>
            <Stack
                direction="column"
                spacing={1}
                sx={{ p: 1, borderBottom: 1, borderColor: 'divider', mb: 1, flexShrink: 0 }}
            >
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={onOpenLoadCourseFromSTAGDialog}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                    aria-label={t('courseBar.loadSingleFromSTAG')}
                >
                    {t('courseBar.loadSingleFromSTAG')}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SchoolIcon />}
                    onClick={onOpenLoadCoursesFromStudentDialog}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                    aria-label={t('courseBar.loadFromStudentPlan')}
                >
                    {t('courseBar.loadFromStudentPlan')}
                </Button>
                {courses &&
                    courses.length > 0 && ( // Zobrazit jen pokud jsou nějaké předměty
                        <Tooltip title={t('courseBar.removeAllCoursesTooltip')}>
                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteSweepIcon />}
                                onClick={onRemoveAllCourses} // Použití nové prop
                                sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                                aria-label={t('courseBar.removeAllCourses')}
                            >
                                {t('courseBar.removeAllCourses')}
                            </Button>
                        </Tooltip>
                    )}
            </Stack>

            {!courses || courses.length === 0 ? (
                <Box
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography color="text.secondary">{t('labels.noCoursesToDisplay')}</Typography>
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, overflowY: 'auto', scrollbarGutter: 'stable' }}>
                    <SimpleTreeView
                        expandedItems={expandedItems}
                        onExpandedItemsChange={handleExpandedItemsChange}
                        sx={{ flexGrow: 1 }}
                        slots={{
                            collapseIcon: ExpandMoreIcon,
                            expandIcon: ChevronRightIcon,
                        }}
                    >
                        {useHierarchicalView ? renderHierarchicalView() : renderDepartmentalView()}
                    </SimpleTreeView>
                </Box>
            )}
        </Box>
    );
}

export default CourseBar;
