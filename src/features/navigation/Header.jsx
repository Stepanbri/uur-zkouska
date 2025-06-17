import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Logo from '../../Logo';

// Import flag icons
import '/node_modules/flag-icons/css/flag-icons.min.css';

/**
 * Komponenta hlavičky aplikace.
 * Zobrazuje logo, navigační odkazy, a ovládací prvky pro přepínání jazyka,
 * motivu a pro otevření postranního menu na mobilních zařízeních.
 * @param {object} props - Vlastnosti komponenty.
 * @param {Array<object>} props.navItems - Pole navigačních položek k zobrazení.
 * @param {string} props.mode - Aktuální barevný motiv ('light' nebo 'dark').
 * @param {string} props.currentLanguage - Aktuálně zvolený jazyk.
 * @param {Array<object>} props.languages - Pole dostupných jazyků.
 * @param {Function} props.toggleColorMode - Funkce pro přepnutí barevného motivu.
 * @param {Function} props.changeLanguage - Funkce pro změnu jazyka.
 * @param {Function} props.onDrawerToggle - Funkce pro otevření/zavření postranního menu.
 * @param {boolean} props.isMobileOrSmaller - Příznak, zda je zobrazení pro mobilní zařízení.
 */
const Header = ({
    navItems,
    mode,
    currentLanguage,
    languages,
    toggleColorMode,
    changeLanguage,
    onDrawerToggle,
    isMobileOrSmaller,
}) => {
    const { t } = useTranslation();
    const location = useLocation();
    
    // State pro menu výběru jazyka
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
    const isLanguageMenuOpen = Boolean(languageMenuAnchor);
    
    const handleLanguageMenuOpen = (event) => {
        setLanguageMenuAnchor(event.currentTarget);
    };
    
    const handleLanguageMenuClose = () => {
        setLanguageMenuAnchor(null);
    };
    
    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
        handleLanguageMenuClose();
    };
      // Funkce pro získání kódu vlajky
    const getFlagCode = (langCode) => {
        switch (langCode) {
            case 'en': return 'gb';
            case 'cs': return 'cz';
            case 'uk': return 'ua';
            case 'ja': return 'jp';
            default: return langCode;
        }
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl" disableGutters>
                <Toolbar>
                    {/* Logo*/}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: isMobileOrSmaller ? 1 : 0, // Na mobilu zabere místo, na desktopu ne (aby se vešlo menu)
                        }}
                    >
                        <Logo />
                    </Box>

                    {/* Desktopové navigační tlačítka */}
                    {!isMobileOrSmaller && (
                        <Box sx={{ ml: 'auto' }}>
                            {navItems.map(item => (
                                <Button
                                    key={item.textKey}
                                    color="inherit"
                                    component={RouterLink}
                                    to={item.path}
                                    sx={{
                                        fontWeight:
                                            location.pathname === item.path ? 'bold' : 'normal',
                                        textDecoration:
                                            location.pathname === item.path ? 'underline' : 'none',
                                        textUnderlineOffset: '4px',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                                        mr: 1,
                                    }}
                                >
                                    {t(item.textKey)}
                                </Button>
                            ))}                            {/* Tlačítko pro výběr jazyka */}
                            <Button
                                color="inherit"
                                onClick={handleLanguageMenuOpen}
                                variant="outlined"
                                size="small"
                                startIcon={<LanguageIcon />}
                                endIcon={<span className={`fi fi-${getFlagCode(currentLanguage)}`} style={{ marginLeft: '4px' }} />}
                                sx={{
                                    ml: 1,
                                    mr: 0.5,
                                    borderColor: 'rgba(255,255,255,0.7)',
                                    color: 'white',
                                    '& .MuiButton-startIcon': { mr: 0.5 },
                                }}
                                aria-controls={isLanguageMenuOpen ? 'language-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={isLanguageMenuOpen ? 'true' : undefined}
                            >
                                {currentLanguage.toUpperCase()}
                            </Button>
                              {/* Menu výběru jazyka */}
                            <Menu
                                id="language-menu"
                                anchorEl={languageMenuAnchor}
                                open={isLanguageMenuOpen}
                                onClose={handleLanguageMenuClose}
                                slotProps={{
                                    list: {
                                        'aria-labelledby': 'language-button',
                                    },
                                }}
                            >
                                {languages.map((lang) => (
                                    <MenuItem 
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        selected={currentLanguage === lang.code}
                                        sx={{ 
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            minWidth: '140px',
                                            gap: 1
                                        }}
                                    >
                                        <span>{lang.name}</span>
                                        <span className={`fi fi-${getFlagCode(lang.code)}`} />
                                    </MenuItem>
                                ))}
                            </Menu>
                            
                            {/* Tlačítko pro přepnutí motivu */}
                            <Tooltip
                                title={
                                    mode === 'dark'
                                        ? t('themeToggle.lightTooltip')
                                        : t('themeToggle.darkTooltip')
                                }
                            >
                                <IconButton
                                    sx={{ ml: 0.5 }}
                                    onClick={toggleColorMode}
                                    color="inherit"
                                >
                                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                    {/* Mobilní menu tlačítko*/}
                    {isMobileOrSmaller && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={onDrawerToggle}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
