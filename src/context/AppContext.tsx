import { createContext, useContext, useEffect, useReducer } from 'react'
import { Inspiration, Project } from '../models/schema'
import {
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
} from '../services/project'
import {
  createInspiration,
  deleteInspiration,
  getInspirationsByProject,
  updateInspiration,
} from '../services/inspiration'

interface AppState {
  projects: Project[]
  inspirations: Inspiration[]
  selectedProject: Project | null
  selectedInspiration: Inspiration | null
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_INSPIRATIONS'; payload: Inspiration[] }
  | { type: 'SET_SELECTED_PROJECT'; payload: Project }
  | { type: 'SET_SELECTED_INSPIRATION'; payload: Inspiration }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'ADD_INSPIRATION'; payload: Inspiration }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'UPDATE_INSPIRATION'; payload: Inspiration }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'DELETE_INSPIRATION'; payload: string }

const initialState: AppState = {
  projects: [],
  inspirations: [],
  selectedProject: null,
  selectedInspiration: null,
  loading: false,
  error: null,
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload }
    case 'SET_INSPIRATIONS':
      return { ...state, inspirations: action.payload }
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload
        ),
        inspirations: state.inspirations.filter(
          (inspiration) => inspiration.projectId !== action.payload
        ),
        selectedProject:
          state.selectedProject?.id === action.payload
            ? null
            : state.selectedProject,
        selectedInspiration:
          state.selectedProject?.id === action.payload
            ? null
            : state.selectedInspiration,
      }
    case 'SET_SELECTED_PROJECT':
      return { ...state, selectedProject: action.payload }
    case 'ADD_INSPIRATION':
      return { ...state, inspirations: [...state.inspirations, action.payload] }
    case 'UPDATE_INSPIRATION':
      return {
        ...state,
        inspirations: state.inspirations.map((inspiration) =>
          inspiration.id === action.payload.id ? action.payload : inspiration
        ),
      }
    case 'DELETE_INSPIRATION':
      return {
        ...state,
        inspirations: state.inspirations.filter(
          (inspiration) => inspiration.id !== action.payload
        ),
        selectedInspiration:
          state.selectedInspiration?.id === action.payload
            ? null
            : state.selectedInspiration,
      }
    case 'SET_SELECTED_INSPIRATION':
      return { ...state, selectedInspiration: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  actions: {
    loadProjects: () => Promise<void>
    loadInspirationsForProject: (projectId: string) => Promise<void>
    createProject: (
      project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<void>
    updateProject: (
      project: Omit<Project, 'createdAt' | 'updatedAt'>
    ) => Promise<void>
    deleteProject: (id: string) => Promise<void>
    createInspiration: (
      inspiration: Omit<Inspiration, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<void>
    updateInspiration: (
      inspiration: Omit<Inspiration, 'createdAt' | 'updatedAt'>
    ) => Promise<void>
    deleteInspiration: (id: string) => Promise<void>
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const actions = {
    loadProjects: async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const projects = await getAllProjects()
        dispatch({ type: 'SET_PROJECTS', payload: projects })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    createProject: async (
      project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const newProject = await createProject(project)
        dispatch({ type: 'ADD_PROJECT', payload: newProject })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    updateProject: async (
      project: Omit<Project, 'createdAt' | 'updatedAt'>
    ) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const updatedProject = await updateProject(project.id, project)
        dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    deleteProject: async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        await deleteProject(id)
        dispatch({ type: 'DELETE_PROJECT', payload: id })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    loadInspirationsForProject: async (projectId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const inspirations = await getInspirationsByProject(projectId)
        dispatch({ type: 'SET_INSPIRATIONS', payload: inspirations })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    createInspiration: async (
      inspiration: Omit<Inspiration, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const newInspiration = await createInspiration(inspiration)
        dispatch({ type: 'ADD_INSPIRATION', payload: newInspiration })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    updateInspiration: async (
      inspiration: Omit<Inspiration, 'createdAt' | 'updatedAt'>
    ) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const updatedInspiration = await updateInspiration(
          inspiration.id,
          inspiration
        )
        dispatch({ type: 'UPDATE_INSPIRATION', payload: updatedInspiration })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    deleteInspiration: async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        await deleteInspiration(id)
        dispatch({ type: 'DELETE_INSPIRATION', payload: id })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
  }

  useEffect(() => {
    actions.loadProjects()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
