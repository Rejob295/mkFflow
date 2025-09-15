"use client";

import { useReducer, useEffect, useCallback, useState } from 'react';
import type { ContentItem, ContentStatus } from '@/lib/types';

type AppState = {
  general: ContentItem[];
  campaigns: Record<string, ContentItem[]>;
  activeView: string;
};

type HistoryState = {
  past: AppState[];
  present: AppState;
  future: AppState[];
};

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_CONTENT'; payload: { view: string; items: ContentItem[] } }
  | { type: 'ADD_CONTENT'; payload: { view: string; item: ContentItem } }
  | { type: 'UPDATE_CONTENT'; payload: { view: string; item: ContentItem } }
  | { type: 'DELETE_CONTENT'; payload: { view: string; id: string } }
  | { type: 'UPDATE_CONTENT_STATUS'; payload: { view: string; id: string; status: ContentStatus } }
  | { type: 'ADD_CAMPAIGN'; payload: string }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'UNDO' };


const contentReducer = (state: AppState, action: Omit<Action, 'UNDO'>): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_CONTENT': {
      const { view, items } = action.payload;
      const sortedItems = items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (view === 'general') {
        return { ...state, general: sortedItems };
      }
      return { ...state, campaigns: { ...state.campaigns, [view]: sortedItems } };
    }

    case 'ADD_CONTENT': {
      const { view, item } = action.payload;
      if (view === 'general') {
        const newGeneral = [...state.general, item].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return { ...state, general: newGeneral };
      }
      const newCampaignContent = [...(state.campaigns[view] || []), item].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { ...state, campaigns: { ...state.campaigns, [view]: newCampaignContent } };
    }
    
    case 'UPDATE_CONTENT': {
      const { view, item: updatedItem } = action.payload;
      const updateAndSort = (items: ContentItem[]) =>
        items.map(item => (item.id === updatedItem.id ? updatedItem : item))
             .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (view === 'general') {
        return { ...state, general: updateAndSort(state.general) };
      }
      return { 
        ...state, 
        campaigns: { 
          ...state.campaigns, 
          [view]: updateAndSort(state.campaigns[view] || []) 
        } 
      };
    }
    
    case 'DELETE_CONTENT': {
      const { view, id } = action.payload;
      if (view === 'general') {
        return { ...state, general: state.general.filter((item) => item.id !== id) };
      }
      const newCampaignContent = (state.campaigns[view] || []).filter((item) => item.id !== id);
      return { ...state, campaigns: { ...state.campaigns, [view]: newCampaignContent } };
    }

    case 'UPDATE_CONTENT_STATUS': {
      const { view, id, status } = action.payload;
      const updateStatus = (items: ContentItem[]) =>
        items.map(item => (item.id === id ? { ...item, status } : item));

      if (view === 'general') {
        return { ...state, general: updateStatus(state.general) };
      }
      return {
        ...state,
        campaigns: {
          ...state.campaigns,
          [view]: updateStatus(state.campaigns[view] || []),
        },
      };
    }

    case 'ADD_CAMPAIGN':
      if (state.campaigns[action.payload] || action.payload === 'general') {
        return state; // Avoid duplicates
      }
      return {
        ...state,
        campaigns: { ...state.campaigns, [action.payload]: [] },
        activeView: action.payload,
      };
      
    case 'DELETE_CAMPAIGN': {
      const { [action.payload]: _, ...remainingCampaigns } = state.campaigns;
      return {
        ...state,
        campaigns: remainingCampaigns,
        activeView: state.activeView === action.payload ? 'general' : state.activeView,
      };
    }

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    default:
      return state;
  }
};

const historyReducer = (state: HistoryState, action: Action): HistoryState => {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) {
        return state;
      }
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    case 'SET_ACTIVE_VIEW': {
        const newPresent = contentReducer(present, action);
        return { ...state, present: newPresent };
    }
    case 'SET_STATE': {
        const newPresent = contentReducer(present, action);
        // Don't record this in history to avoid weird undo loops on load
        return { past: [], present: newPresent, future: [] };
    }
    default: {
      const newPresent = contentReducer(present, action);
      if (present === newPresent) {
        return state;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    }
  }
}

const isBrowser = typeof window !== 'undefined';
const LOCAL_STORAGE_KEY = 'mktflow-state';

export function useContent(getInitialContent: () => ContentItem[]) {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: {
      general: getInitialContent(),
      campaigns: {},
      activeView: 'general',
    },
    future: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to load state from localStorage on the client.
    if (!isBrowser) {
        setIsLoaded(true); // On server, just say we are loaded with initial data.
        return;
    }
    try {
        const storedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedStateJSON) {
            const storedState: AppState = JSON.parse(storedStateJSON);
             // Ensure campaigns is an object
            storedState.campaigns = storedState.campaigns || {};
            
            const reviveDates = (items: ContentItem[] = []) => items.map(item => ({ ...item, date: new Date(item.date) }));
            
            storedState.general = reviveDates(storedState.general);
            Object.keys(storedState.campaigns).forEach(key => {
                storedState.campaigns[key] = reviveDates(storedState.campaigns[key]);
            });
            dispatch({ type: 'SET_STATE', payload: storedState });
        }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isBrowser && isLoaded) {
      try {
        // We only store the 'present' state, not the whole history
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.present));
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }
  }, [state.present, isLoaded]);

  const setContent = useCallback((items: ContentItem[]) => {
    dispatch({ type: 'SET_CONTENT', payload: { view: state.present.activeView, items } });
  }, [state.present.activeView]);

  const addContent = useCallback((item: ContentItem) => {
    dispatch({ type: 'ADD_CONTENT', payload: { view: state.present.activeView, item } });
  }, [state.present.activeView]);
  
  const updateContent = useCallback((item: ContentItem) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { view: state.present.activeView, item } });
  }, [state.present.activeView]);
  
  const deleteContent = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONTENT', payload: { view: state.present.activeView, id } });
  }, [state.present.activeView]);

  const updateContentStatus = useCallback((id: string, status: ContentStatus) => {
    dispatch({ type: 'UPDATE_CONTENT_STATUS', payload: { view: state.present.activeView, id, status } });
  }, [state.present.activeView]);

  const addCampaign = useCallback((name: string) => {
    dispatch({ type: 'ADD_CAMPAIGN', payload: name });
  }, []);
  
  const deleteCampaign = useCallback((name: string) => {
    dispatch({ type: 'DELETE_CAMPAIGN', payload: name });
  }, []);

  const setActiveView = useCallback((view: string) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const { present } = state;
  const contentForActiveView = present.activeView === 'general' 
    ? present.general 
    : (present.campaigns && present.campaigns[present.activeView]) || [];
  
  return { 
    content: contentForActiveView, 
    setContent, 
    addContent, 
    updateContent,
    deleteContent,
    updateContentStatus,
    isLoaded,
    campaigns: Object.keys(present.campaigns || {}),
    addCampaign,
    deleteCampaign,
    activeView: present.activeView,
    setActiveView,
    undo,
    canUndo: state.past.length > 0
  };
}
