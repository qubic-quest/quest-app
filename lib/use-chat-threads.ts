"use client";

import { useCallback, useEffect, useState } from "react";

// Define our own Message type since we're managing state externally
export interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date | string;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

const STORAGE_KEY = "qubic-deepsight-threads";
const ACTIVE_THREAD_KEY = "qubic-deepsight-active-thread";
const MESSAGES_KEY_PREFIX = "qubic-deepsight-messages-";

// Helper to get messages storage key for a thread
const getMessagesKey = (threadId: string) => `${MESSAGES_KEY_PREFIX}${threadId}`;

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Load threads from localStorage on mount
  useEffect(() => {
    const storedThreads = localStorage.getItem(STORAGE_KEY);
    const storedActiveId = localStorage.getItem(ACTIVE_THREAD_KEY);
    
    if (storedThreads) {
      try {
        const parsed = JSON.parse(storedThreads);
        setThreads(parsed);
      } catch (e) {
        console.error("Failed to parse stored threads:", e);
      }
    }
    
    if (storedActiveId) {
      setActiveThreadId(storedActiveId);
    }
  }, []);

  // Save threads to localStorage whenever they change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  // Save active thread ID
  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem(ACTIVE_THREAD_KEY, activeThreadId);
    }
  }, [activeThreadId]);

  const createThread = useCallback(() => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    
    return newThread;
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
  }, [activeThreadId]);

  const updateThreadTitle = useCallback((threadId: string, title: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, title, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const updateThreadActivity = useCallback((threadId: string, messageCount: number) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messageCount, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const switchThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
  }, []);

  const getActiveThread = useCallback(() => {
    return threads.find((t) => t.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  // Save messages for a specific thread
  const saveMessages = useCallback((threadId: string, messages: StoredMessage[]) => {
    try {
      localStorage.setItem(getMessagesKey(threadId), JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages:", e);
    }
  }, []);

  // Load messages for a specific thread
  const loadMessages = useCallback((threadId: string): StoredMessage[] => {
    try {
      const stored = localStorage.getItem(getMessagesKey(threadId));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load messages:", e);
      return [];
    }
  }, []);

  // Delete messages when thread is deleted
  const deleteThreadMessages = useCallback((threadId: string) => {
    try {
      localStorage.removeItem(getMessagesKey(threadId));
    } catch (e) {
      console.error("Failed to delete messages:", e);
    }
  }, []);

  // Enhanced delete that also removes messages
  const deleteThreadWithMessages = useCallback((threadId: string) => {
    deleteThread(threadId);
    deleteThreadMessages(threadId);
  }, [deleteThread, deleteThreadMessages]);

  return {
    threads,
    activeThreadId,
    activeThread: getActiveThread(),
    createThread,
    deleteThread: deleteThreadWithMessages,
    updateThreadTitle,
    updateThreadActivity,
    switchThread,
    saveMessages,
    loadMessages,
  };
}
