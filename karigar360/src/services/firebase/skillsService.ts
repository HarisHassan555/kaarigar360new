import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getFirebaseServices } from './init';

const SKILLS_COLLECTION = 'skills';
const GLOBAL_SKILLS_DOC_ID = 'global';

/**
 * Get all available skills (predefined + global from Firestore)
 */
export const getAllSkills = async (): Promise<string[]> => {
  try {
    const { db } = await getFirebaseServices();
    
    // Get global skills document
    const skillsDocRef = doc(db, SKILLS_COLLECTION, GLOBAL_SKILLS_DOC_ID);
    const skillsDoc = await getDoc(skillsDocRef);
    
    if (skillsDoc.exists()) {
      const data = skillsDoc.data();
      return data.skills || [];
    }
    
    // Return empty array if document doesn't exist yet
    return [];
  } catch (error: any) {
    console.error('Error fetching global skills:', error);
    // Return empty array on error to not break the app
    return [];
  }
};

/**
 * Add a new skill to the global skills list
 */
export const addGlobalSkill = async (skillName: string): Promise<void> => {
  try {
    const { db } = await getFirebaseServices();
    
    const skillNameTrimmed = skillName.trim();
    if (!skillNameTrimmed) {
      throw new Error('Skill name cannot be empty');
    }
    
    // Get current global skills
    const skillsDocRef = doc(db, SKILLS_COLLECTION, GLOBAL_SKILLS_DOC_ID);
    const skillsDoc = await getDoc(skillsDocRef);
    
    let currentSkills: string[] = [];
    if (skillsDoc.exists()) {
      currentSkills = skillsDoc.data().skills || [];
    }
    
    // Check if skill already exists (case-insensitive)
    const skillExists = currentSkills.some(
      skill => skill.toLowerCase() === skillNameTrimmed.toLowerCase()
    );
    
    if (skillExists) {
      throw new Error('This skill already exists in the global list');
    }
    
    // Add the new skill
    const updatedSkills = [...currentSkills, skillNameTrimmed];
    
    // Save to Firestore
    await setDoc(skillsDocRef, {
      skills: updatedSkills,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    console.log('✅ Global skill added successfully:', skillNameTrimmed);
  } catch (error: any) {
    console.error('Error adding global skill:', error);
    throw new Error(error.message || 'Failed to add global skill');
  }
};

