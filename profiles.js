// Profile Management System for World Cup Squad Selector
// A "profile" represents a complete World Cup with all 22 national team squads

const PROFILE_STORAGE_KEY = 'wc2026_profiles';
const CURRENT_PROFILE_KEY = 'wc2026_current_profile';
const DEFAULT_PROFILE_ID = 'default';
const DEFAULT_PROFILE_NAME = 'Mi Mundial';

// Generate random ID for new profiles
function generateProfileId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Get all profiles metadata
function getProfiles() {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing profiles:', e);
        }
    }
    
    // Create default profile if none exists
    const defaultProfiles = {
        [DEFAULT_PROFILE_ID]: {
            id: DEFAULT_PROFILE_ID,
            name: DEFAULT_PROFILE_NAME,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfiles));
    return defaultProfiles;
}

// Save profiles metadata
function saveProfiles(profiles) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

// Get current profile ID
function getCurrentProfileId() {
    const stored = localStorage.getItem(CURRENT_PROFILE_KEY);
    if (stored && getProfiles()[stored]) {
        return stored;
    }
    // Fallback to default
    localStorage.setItem(CURRENT_PROFILE_KEY, DEFAULT_PROFILE_ID);
    return DEFAULT_PROFILE_ID;
}

// Get current profile metadata
function getCurrentProfile() {
    const profiles = getProfiles();
    const currentId = getCurrentProfileId();
    return profiles[currentId] || profiles[DEFAULT_PROFILE_ID];
}

// Set current profile
function setCurrentProfile(profileId) {
    const profiles = getProfiles();
    if (profiles[profileId]) {
        localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
        return true;
    }
    return false;
}

// Create a new profile
function createProfile(name, switchToIt = true) {
    const profiles = getProfiles();
    const id = generateProfileId();
    
    profiles[id] = {
        id: id,
        name: name || `Mundial ${Object.keys(profiles).length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    saveProfiles(profiles);
    
    if (switchToIt) {
        setCurrentProfile(id);
    }
    
    return id;
}

// Rename a profile
function renameProfile(profileId, newName) {
    const profiles = getProfiles();
    if (profiles[profileId]) {
        profiles[profileId].name = newName;
        profiles[profileId].updatedAt = new Date().toISOString();
        saveProfiles(profiles);
        return true;
    }
    return false;
}

// Delete a profile and all its data
function deleteProfile(profileId) {
    if (profileId === DEFAULT_PROFILE_ID) {
        console.warn('Cannot delete default profile');
        return false;
    }
    
    const profiles = getProfiles();
    if (!profiles[profileId]) {
        return false;
    }
    
    // Delete all squad data for this profile
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`wc2026_${profileId}_`)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
    
    // Remove profile metadata
    delete profiles[profileId];
    saveProfiles(profiles);
    
    // If this was the current profile, switch to default
    if (getCurrentProfileId() === profileId) {
        setCurrentProfile(DEFAULT_PROFILE_ID);
    }
    
    return true;
}

// Duplicate a profile
function duplicateProfile(sourceProfileId, newName) {
    const profiles = getProfiles();
    if (!profiles[sourceProfileId]) {
        return null;
    }
    
    // Create new profile
    const newId = createProfile(newName || `${profiles[sourceProfileId].name} (copia)`, false);
    
    // Copy all squad data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`wc2026_${sourceProfileId}_`)) {
            const countryCode = key.replace(`wc2026_${sourceProfileId}_`, '');
            const data = localStorage.getItem(key);
            localStorage.setItem(`wc2026_${newId}_${countryCode}`, data);
        }
    }
    
    return newId;
}

// Get squad key for current profile
function getSquadKey(countryCode) {
    const profileId = getCurrentProfileId();
    return `wc2026_${profileId}_${countryCode}`;
}

// Get saved squad for a country in current profile
function getSquad(countryCode) {
    const key = getSquadKey(countryCode);
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Save squad for a country in current profile
function saveSquad(countryCode, squadData) {
    const key = getSquadKey(countryCode);
    localStorage.setItem(key, JSON.stringify(squadData));
    
    // Update profile timestamp
    const profiles = getProfiles();
    const currentId = getCurrentProfileId();
    if (profiles[currentId]) {
        profiles[currentId].updatedAt = new Date().toISOString();
        saveProfiles(profiles);
    }
}

// Get all squads for current profile
function getAllSquads() {
    const profileId = getCurrentProfileId();
    const squads = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`wc2026_${profileId}_`)) {
            const countryCode = key.replace(`wc2026_${profileId}_`, '');
            try {
                squads[countryCode] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                console.error(`Error parsing squad for ${countryCode}:`, e);
            }
        }
    }
    
    return squads;
}

// Migrate old data (without profile prefix) to default profile
function migrateOldData() {
    const oldKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Old format: wc2026_squad_spain (without profile ID)
        if (key && key.startsWith('wc2026_squad_')) {
            oldKeys.push(key);
        }
    }
    
    if (oldKeys.length > 0) {
        console.log(`Migrating ${oldKeys.length} old squad data to default profile...`);
        oldKeys.forEach(oldKey => {
            const countryCode = oldKey.replace('wc2026_squad_', '');
            const newKey = `wc2026_${DEFAULT_PROFILE_ID}_${countryCode}`;
            const data = localStorage.getItem(oldKey);
            
            // Only migrate if no data exists in new location
            if (!localStorage.getItem(newKey) && data) {
                localStorage.setItem(newKey, data);
            }
            
            // Remove old key
            localStorage.removeItem(oldKey);
        });
        console.log('Migration complete.');
    }
}

// Initialize profile system (call this on page load)
function initProfiles() {
    // Ensure profiles exist
    getProfiles();
    
    // Ensure current profile is set
    getCurrentProfileId();
    
    // Migrate old data if needed
    migrateOldData();
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.ProfileManager = {
        generateProfileId,
        getProfiles,
        getCurrentProfileId,
        getCurrentProfile,
        setCurrentProfile,
        createProfile,
        renameProfile,
        deleteProfile,
        duplicateProfile,
        getSquadKey,
        getSquad,
        saveSquad,
        getAllSquads,
        initProfiles,
        DEFAULT_PROFILE_ID,
        DEFAULT_PROFILE_NAME
    };
}
