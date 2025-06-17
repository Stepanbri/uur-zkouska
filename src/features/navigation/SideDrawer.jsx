import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import {
    Box,
    Collapse,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Logo from '../../Logo';

// Import flag icons
import '/node_modules/flag-icons/css/flag-icons.min.css';

/**
 * Komponenta postranního menu (Drawer) pro mobilní zobrazení.
 * Poskytuje navigační odkazy a ovládací prvky, které jsou v desktopové verzi v hlavičce.
 * @param {object} props - Vlastnosti komponenty.
 * @param {Array<object>} props.navItems - Pole navigačních položek k zobrazení.
 * @param {string} props.mode - Aktuální barevný motiv ('light' nebo 'dark').
 * @param {string} props.currentLanguage - Aktuálně zvolený jazyk.
 * @param {Array<object>} props.languages - Pole dostupných jazyků.
 * @param {Function} props.toggleColorMode - Funkce pro přepnutí barevného motivu.
 * @param {Function} props.changeLanguage - Funkce pro změnu jazyka.
 * @param {Function} props.onDrawerToggle - Funkce pro zavření menu.
 * @param {boolean} props.mobileOpen - Stav, zda je menu otevřené.
 * @param {boolean} props.isMobileOrSmaller - Příznak, zda je zobrazení pro mobilní zařízení (podmínka pro renderování).
 */
const SideDrawer = ({
    navItems,
    mode,
    currentLanguage,
    languages,
    toggleColorMode,
    changeLanguage,
    onDrawerToggle,
    mobileOpen,
    isMobileOrSmaller,
}) => {
    const { t } = useTranslation();
    const location = useLocation();

    // State pro rozbalení seznamu jazyků
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

    const handleLanguageMenuToggle = e => {
        e.stopPropagation(); // Zabraňuje propagaci události k rodičovskému Box, který by zavřel drawer
        setLanguageMenuOpen(!languageMenuOpen);
    };

    const handleLanguageChange = (langCode, e) => {
        e.stopPropagation(); // Zabraňuje propagaci události k rodičovskému Box, který by zavřel drawer
        changeLanguage(langCode);
    };
    // Funkce pro získání kódu vlajky
    const getFlagCode = langCode => {
        switch (langCode) {
            case 'en':
                return 'gb';
            case 'cs':
                return 'cz';
            case 'uk':
                return 'ua';
            case 'ja':
                return 'jp';
            default:
                return langCode;
        }
    };

    // Obsah, který se zobrazí uvnitř menu.
    // Při kliknutí na jakoukoliv položku se menu zavře díky onDrawerToggle na root elementu.
    const drawerContent = (
        <Box
            onClick={onDrawerToggle}
            sx={{ textAlign: 'center', width: { xs: '80vw', sm: 280 } }}
            role="presentation"
        >
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <Logo inDrawer={true} />
            </Box>
            <Divider />
            <List>
                {navItems.map(item => (
                    <ListItem key={item.textKey} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={t(item.textKey)} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {' '}
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLanguageMenuToggle}>
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                            <LanguageIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('languageToggle')} />
                        <span
                            className={`fi fi-${getFlagCode(currentLanguage)}`}
                            style={{ marginRight: '8px' }}
                        />
                        {languageMenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={languageMenuOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {languages.map(lang => (
                            <ListItemButton
                                key={lang.code}
                                sx={{ pl: 4 }}
                                selected={currentLanguage === lang.code}
                                onClick={e => handleLanguageChange(lang.code, e)}
                            >
                                <ListItemText primary={lang.name} />
                                <span className={`fi fi-${getFlagCode(lang.code)}`} />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleColorMode}>
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                mode === 'dark' ? t('themeToggle.light') : t('themeToggle.dark')
                            }
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen && isMobileOrSmaller}
            onClose={onDrawerToggle}
            ModalProps={{ keepMounted: true }} // Důležité pro lepší výkon na mobilních zařízeních
            slotProps={{ paper: { sx: { width: { xs: '80vw', sm: 280 } } } }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default SideDrawer;
