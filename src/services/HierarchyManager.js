// Service pro správu hierarchie pracovišť (fakult a kateder)
// Načítá hierarchii z STAG API a poskytuje metody pro její využití

class HierarchyManager {
    constructor() {
        this.hierarchy = null;
        this.facultyMap = new Map(); // mapa zkratka katedry -> fakulta
        this.workplaceMap = new Map(); // mapa číslo pracoviště -> workplace objekt
        this.isLoaded = false;
        this.isLoading = false;
    }

    // Načte hierarchii pracovišť z API
    async loadHierarchy(stagApiService, language = 'cs') {
        if (this.isLoading) {
            // Pokud už probíhá načítání, počkáme na něj
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.isLoaded;
        }

        if (this.isLoaded) {
            return true;
        }

        this.isLoading = true;        try {
            const response = await stagApiService.getHierarchiePracovist(language);
            console.log('Hierarchy API response:', response);
            
            // Zkusíme nejdříve response.pracoviste (standardní struktura)
            let hierarchyData = null;
            if (response && response.pracoviste && Array.isArray(response.pracoviste)) {
                hierarchyData = response.pracoviste;
            }
            // Pokud response je přímo pole
            else if (Array.isArray(response)) {
                hierarchyData = response;
            }
            
            if (hierarchyData && hierarchyData.length > 0) {
                this.hierarchy = hierarchyData;
                this._buildMaps();
                this.isLoaded = true;
                console.log('Hierarchy loaded successfully:', {
                    totalWorkplaces: this.hierarchy.length,
                    faculties: this._getFaculties().length,
                    departmentMappings: this.facultyMap.size
                });
                return true;
            } else {
                console.error('Invalid hierarchy response:', {
                    response,
                    hasObject: !!response,
                    hasPracoviste: !!(response && response.pracoviste),
                    isArray: Array.isArray(response),
                    isArrayPracoviste: !!(response && Array.isArray(response.pracoviste)),
                    length: response?.length,
                    pracovisteLength: response?.pracoviste?.length
                });
                throw new Error('Invalid hierarchy response structure');
            }} catch (error) {
            console.error('Failed to load workplace hierarchy:', error);
            console.error('Response received:', error.response || 'No response data');
            this.isLoaded = false;
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    // Vytvoří interní mapy pro rychlé vyhledávání
    _buildMaps() {
        if (!this.hierarchy) return;

        // Vytvoření mapy pracovišť pro rychlé vyhledávání
        this.hierarchy.forEach(workplace => {
            this.workplaceMap.set(workplace.zkratka, workplace);
        });

        // Vytvoření mapy katedra -> fakulta
        this.hierarchy.forEach(workplace => {
            if (workplace.typPracoviste === 'K') { // Katedra
                const faculty = this._findFacultyForWorkplace(workplace);
                if (faculty) {
                    this.facultyMap.set(workplace.zkratka, faculty);
                }
            }
        });
    }    // Najde fakultu pro dané pracoviště (procházením hierarchie nahoru)
    _findFacultyForWorkplace(workplace) {
        if (!workplace) return null;
        
        // Speciální případ pro REK - není to fakulta, ale rektorát
        if (workplace.zkratka === 'REK') {
            return null;
        }
        
        // Pokud je pracoviště samo fakultou (ale ne REK)
        if (workplace.typPracoviste === 'F' && workplace.zkratka !== 'REK') {
            return workplace;
        }

        // Procházíme hierarchii nahoru
        let current = workplace;
        while (current && current.nadrazenePracoviste) {
            const parent = this.workplaceMap.get(current.nadrazenePracoviste);
            if (!parent) break;
            
            // Speciální případ pro REK - není to fakulta
            if (parent.zkratka === 'REK') {
                return null;
            }
            
            if (parent.typPracoviste === 'F') {
                return parent;
            }
            current = parent;
        }

        return null;
    }

    // Získá fakultu pro danou katedru/pracoviště podle zkratky
    getFacultyForDepartment(departmentCode) {
        if (!this.isLoaded || !departmentCode) {
            return null;
        }

        // Zkusíme přímé vyhledání v mapě
        const faculty = this.facultyMap.get(departmentCode);
        if (faculty) {
            return faculty;
        }

        // Pokud nenajdeme v mapě, zkusíme najít pracoviště a jeho fakultu
        const workplace = this.workplaceMap.get(departmentCode);
        if (workplace) {
            return this._findFacultyForWorkplace(workplace);
        }

        return null;
    }    // Získá všechny fakulty (bez REK)
    _getFaculties() {
        if (!this.hierarchy) return [];
        return this.hierarchy.filter(w => w.typPracoviste === 'F' && w.zkratka !== 'REK');
    }

    // Získá všechny katedry pro danou fakultu
    getDepartmentsForFaculty(facultyCode) {
        if (!this.isLoaded || !facultyCode) return [];

        const departments = [];
        
        this.hierarchy.forEach(workplace => {
            if (workplace.typPracoviste === 'K') { // Katedra
                const faculty = this.getFacultyForDepartment(workplace.zkratka);
                if (faculty && faculty.zkratka === facultyCode) {
                    departments.push(workplace);
                }
            }
        });

        return departments;
    }

    // Získá hierarchickou strukturu pro zobrazení v UI
    getHierarchicalStructure(courses) {
        if (!this.isLoaded || !courses) return {};

        const structure = {};

        courses.forEach(course => {
            const departmentCode = course.departmentCode;
            const faculty = this.getFacultyForDepartment(departmentCode);
            
            let facultyKey = 'UNKNOWN';
            let facultyName = 'Neznámá fakulta';
            
            if (faculty) {
                facultyKey = faculty.zkratka;
                facultyName = faculty.nazev;            } else {
                // Speciální přípa    d pro REK nebo pracoviště přímo pod REK
                const workplace = this.workplaceMap.get(departmentCode);
                if (workplace) {
                    // Pokud je to přímo REK
                    if (workplace.zkratka === 'REK') {
                        facultyKey = 'REK';
                        facultyName = 'Rektorát';
                    }
                    // Pokud je nadřazené pracoviště REK nebo je to pracoviště bez nadřazeného
                    else if (workplace.nadrazenePracoviste === 'REK' || !workplace.nadrazenePracoviste) {
                        facultyKey = 'REK';
                        facultyName = 'Rektorát a centrální pracoviště';
                    }
                    // Pokud pracoviště nepatří pod žádnou fakultu
                    else {
                        facultyKey = 'UNKNOWN';
                        facultyName = 'Neznámá fakulta';
                    }
                } else {
                    // Pokud pracoviště vůbec nenajdeme v hierarchii
                    facultyKey = 'UNKNOWN';
                    facultyName = 'Neznámá fakulta';
                }
            }

            // Vytvoření struktury Faculty -> Department -> Courses
            if (!structure[facultyKey]) {
                structure[facultyKey] = {
                    name: facultyName,
                    departments: {}
                };
            }

            if (!structure[facultyKey].departments[departmentCode]) {
                structure[facultyKey].departments[departmentCode] = {
                    name: this._getDepartmentName(departmentCode),
                    courses: []
                };
            }

            structure[facultyKey].departments[departmentCode].courses.push(course);
        });

        return structure;
    }

    // Získá název katedry/pracoviště
    _getDepartmentName(departmentCode) {
        const workplace = this.workplaceMap.get(departmentCode);
        return workplace ? workplace.nazev : departmentCode;
    }

    // Resetuje načtenou hierarchii (pro účely testování nebo obnovení)
    reset() {
        this.hierarchy = null;
        this.facultyMap.clear();
        this.workplaceMap.clear();
        this.isLoaded = false;
        this.isLoading = false;
    }

    // Získá informace o stavu načítání
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.isLoading,
            hierarchySize: this.hierarchy ? this.hierarchy.length : 0,
            facultyMappings: this.facultyMap.size
        };
    }
}

// Singleton instance
const hierarchyManager = new HierarchyManager();

export default hierarchyManager;
