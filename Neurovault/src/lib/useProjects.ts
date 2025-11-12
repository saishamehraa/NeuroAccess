'use client';
import { useState, useEffect } from 'react';
import { Project } from '@/lib/projects';

const STORAGE_KEY = 'neuroaicomparison:projects';
const ACTIVE_PROJECT_KEY = 'neuroaicomparison:active-project';

function safeParseProjects(raw: string | null): Project[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Invalid projects JSON in localStorage - resetting...');
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY);

    setProjects(safeParseProjects(saved));

    if (activeId && activeId !== 'null') {
      setActiveProjectId(activeId);
    }
    setIsLoaded(true);
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.warn('Failed to save projects to localStorage:', error);
    }
  }, [projects, isLoaded]);

  // Save active project ID to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (activeProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    } catch (error) {
      console.warn('Failed to save active project to localStorage:', error);
    }
  }, [activeProjectId, isLoaded]);

  const createProject = (project: Project) => setProjects(prev => [project, ...prev]);
  const updateProject = (updated: Project) =>
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };
  const selectProject = (id: string | null) => setActiveProjectId(id);
  const getActiveProject = (): Project | null =>
    activeProjectId ? projects.find(p => p.id === activeProjectId) || null : null;
  const getProjectById = (id: string): Project | null =>
    projects.find(p => p.id === id) || null;

  return {
    projects,
    activeProjectId,
    activeProject: getActiveProject(),
    isLoaded,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    getProjectById,
  };
}
