import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { PromptGallery } from "./components/PromptGallery";
import { SearchAndFilters } from "./components/SearchAndFilters";
import { PromptModal } from "./components/PromptModal";
import { CustomPromptBuilder } from "./components/CustomPromptBuilder";
import { prompts, categories, type Prompt, getCategoryById } from "./data/promptsData";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "./supabaseClient";
import { type Session } from  "@supabase/supabase-js";
import { Wand2 } from "./components/SimpleIcons";

// Compute APP_URLS locally for cross-app navigation
const isProd = import.meta.env.MODE === 'production';
const origin = typeof window !== 'undefined' && window.location && window.location.origin ? window.location.origin : 'http://localhost:3000';
const APP_URLS = {
  neurovault: isProd ? `${origin}/neurovault/` : 'http://localhost:3001',
};

// Simple SVG Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const WandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 4V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2" />
    <path d="M10 4h4l2 6-2 6H10l-2-6 2-6z" />
    <path d="m15.5 21.5-3.5-7 3.5-7" />
    <path d="m9.5 14.5 3.5 7-3.5-7" />
  </svg>
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "grid">("gallery");
  //const [allPrompts, setAllPrompts] = useState(prompts);
const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);

 // Add useEffect to fetch data from Supabase on component mount
  useEffect(() => {

     const handleAuthAndFetch = async (currentSession: Session | null) => {
      setSession(currentSession);
      if (!currentSession) {
        setAllPrompts([]); // Clear prompts if user logs out
        return;
      }
      
      const userId = currentSession.user.id;

      // Fetch template prompts AND user-specific prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .or(`owner_id.eq.${userId},owner_id.is.null`);

      // Fetch the IDs of prompts saved by the current user
      const { data: savedPromptsData, error: savedPromptsError } = await supabase
        .from('user_saved_prompts')
        .select('prompt_id')
        .eq('user_id', userId);

      if (promptsError || savedPromptsError) {
        console.error('Error fetching data:', promptsError || savedPromptsError);
        return;
      }

      const savedPromptIds = new Set(savedPromptsData.map(item => item.prompt_id));

      const transformedData = promptsData.map(p => {
        const category = getCategoryById(p.category);
        return {
          ...p,
          icon: category ? category.icon : Wand2,
          fullPrompt: p.fullprompt, 
          useCase: p.usecase,
          tags: p.tags ? String(p.tags).split(',').map(t => t.trim()) : [],
          // Set the 'saved' status based on the junction table data
          saved: savedPromptIds.has(String(p.id)), 
        };
      });
      setAllPrompts(transformedData as unknown as Prompt[]);
    };

    // Initial check
     supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      handleAuthAndFetch(session);
    });

    // Listen for changes in authentication state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        handleAuthAndFetch(session);
      }
    );

    const fetchPrompts = async () => {
      // Use .select() to get all rows from the 'prompts' table
      const { data, error } = await supabase.from('prompts').select('*');
      console.log("Data from Supabase:", data);
      if (error) {
        console.error('Error fetching prompts:', error);
      } else {
        // Update the state with the data from the database
        //setAllPrompts(data as Prompt[]);
        const transformedData = data.map(p => {
          const category = getCategoryById(p.category);
          return {
            ...p,
            icon: category ? category.icon : WandIcon, // Assign icon from category, or a default
            fullPrompt: p.fullprompt, 
            useCase: p.usecase,
            tags: p.tags ? String(p.tags).split(',').map(t => t.trim()) : [],
          };
        });
        setAllPrompts(transformedData as unknown as Prompt[]);
      }
    };
    //fetchPrompts();
    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe(); 

  }, []); // The empty dependency array ensures this runs only once

  /* // Change toggleSave to an async function
  const toggleSave = async (id: string | number) => {
    if (!session) return;
    const userId = session.user.id;
    const promptId = String(id);

  const promptToUpdate = allPrompts.find(p => p.id === id);
    if (!promptToUpdate) return;
    const isCurrentlySaved = promptToUpdate.saved;

    if (!isCurrentlySaved) {
    // Perform the database update first
    const { error } = await supabase
      .from('user_saved_prompts')
      .delete()
      .eq('user_id', userId)
      .eq('prompt_id', promptId);

      /* .from('prompts')
      .update({ saved: !isCurrentlySaved })
      .eq('id', id); */

     /* if (error) console.error('Error unsaving prompt:', error);
    } else {
      // SAVE: Insert a row into the junction table
      const { error } = await supabase
        .from('user_saved_prompts')
        .insert({ user_id: userId, prompt_id: promptId });
      if (error) console.error('Error saving prompt:', error);
    }

    // Update local state immediately for snappy UI
    setAllPrompts(prev =>
      prev.map(p => (String(p.id) === promptId ? { ...p, saved: !isCurrentlySaved } : p))
    );
  }; */

    /* if (error) {
      console.error('Error updating prompt saved state:', error);
    } else {
      // If the database update is successful, update the local state
      setAllPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
      );
    }
  }; */

// Replace your entire toggleSave function with this one

const toggleSave = async (id: string | number) => {
  if (!session) return;
  const userId = session.user.id;
  const promptId = String(id);

  const promptToUpdate = allPrompts.find(p => String(p.id) === promptId);
  if (!promptToUpdate) return;

  const isCurrentlySaved = promptToUpdate.saved;

  // --- THIS IS THE CORRECTED LOGIC ---
  if (isCurrentlySaved) {
    // If it's already saved, we need to UNSAVE (DELETE)
    const { error } = await supabase
      .from('user_saved_prompts')
      .delete()
      .eq('user_id', userId)
      .eq('prompt_id', promptId);

    if (error) console.error('Error unsaving prompt:', error);

  } else {
    // If it's not saved, we need to SAVE (INSERT)
    const { error } = await supabase
      .from('user_saved_prompts')
      .insert({ user_id: userId, prompt_id: promptId });
      
    if (error) console.error('Error saving prompt:', error);
  }
  // --- END OF CORRECTION ---

  // This part is correct and updates the UI instantly
  setAllPrompts(prev =>
    prev.map(p => (String(p.id) === promptId ? { ...p, saved: !isCurrentlySaved } : p))
  );
};

  // Change onSaveCustomPrompt to an async function
  const onSaveCustomPrompt = async (newPromptData: any) => {
    if (!session) return;
    const userId = session.user.id;
    
    // Prepare the new prompt data for insertion
    const promptToInsert = {
      ...newPromptData,
      id: crypto.randomUUID(), // Generate a unique ID
      owner_id: userId,        // Associate the prompt with the current user
      fullprompt: newPromptData.fullPrompt, // Match lowercase 'fullprompt' column
      usecase: newPromptData.useCase,       // Match lowercase 'usecase' column
      tags: newPromptData.tags.join(','),   // Join the tags array into a string
    };
    // Remove the frontend-only properties before insert
    delete promptToInsert.fullPrompt;
    delete promptToInsert.useCase;
    delete promptToInsert.icon;
    delete promptToInsert.saved;

    // Perform the database insert first
    /* const { data, error } = await supabase.from('prompts').insert([newPrompt]);
    if (error) {
      console.error('Error saving prompt:', error);
    } else {
      // If the database insert is successful, update the local state
      setAllPrompts((prev) => [...prev, data![0] as Prompt]); */

      const { data, error } = await supabase.from('prompts').insert([promptToInsert]).select();

    if (error) {
      console.error('Error saving prompt:', error);
    } else {
      // Re-fetch or transform the single returned record to update the UI correctly
      const newPrompt = data![0];
      const category = getCategoryById(newPrompt.category);
      const transformedPrompt = {
        ...newPrompt,
        icon: category ? category.icon : WandIcon,
        fullPrompt: newPrompt.fullprompt,
        useCase: newPrompt.usecase,
        tags: String(newPrompt.tags).split(',').map(t => t.trim()),
        saved: false, // New prompts are not saved by default
      };
      setAllPrompts((prev) => [...prev, transformedPrompt as unknown as Prompt]);
    }
  };

  // Toggle saved state
  //const toggleSave = (id: string | number) => {
    //setAllPrompts((prev) =>
      //prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
    //);
  //};

  //const onSaveCustomPrompt = (newPrompt: any) => {
  //setAllPrompts((prev) => [newPrompt, ...prev]);
  //};

  // Use Vite's BASE_URL directly
  const basename = import.meta.env.BASE_URL;

  const filteredPrompts = allPrompts.filter((prompt) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (prompt.text?.toLowerCase() ?? '').includes(term) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(term)) ||
      (prompt.fullPrompt?.toLowerCase() ?? '').includes(term);
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Conditionally render a friendly sign-in prompt if user is not signed in.
  // Do not auto-redirect — the user may sign in at NeuroVault (same origin) and
  // the Supabase auth listener above will update `session` automatically.
  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <h1 className="text-2xl font-bold mb-4">Please sign in to NeuroVault</h1>
          <p className="text-gray-400 mb-6">This Prompt Library uses the same account as NeuroVault. Sign into NeuroVault first and this page will populate automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => { window.location.href = APP_URLS.neurovault }} className="bg-purple-600">Open NeuroVault</Button>
            <Button onClick={() => { window.location.reload() }} variant="outline">Check again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter basename={basename}>
      <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.05)_1px,_transparent_0)] bg-[size:40px_40px] pointer-events-none" />

        <div className="relative z-10">
          {/* Back button (top-left) to return to NeuroVault */}
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => { window.location.href = APP_URLS.neurovault }}
              className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
              aria-label="Back to NeuroVault"
            >
              ← Back
            </button>
          </div>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
                AI Prompt Library
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
                Discover 20+ carefully crafted prompts to supercharge your AI interactions. Search, filter, and customize prompts for any use case.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button
                  onClick={() => setShowCustomBuilder(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <WandIcon />
                  Build Custom Prompt
                </Button>
                <Button
                  onClick={() => setViewMode(viewMode === "gallery" ? "grid" : "gallery")}
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                >
                  <PlusIcon />
                  {viewMode === "gallery" ? "Grid View" : "Gallery View"}
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              resultCount={filteredPrompts.length}
            />

            {/* Prompt Gallery */}
            <PromptGallery
              prompts={filteredPrompts}
              onPromptClick={setSelectedPrompt}
              viewMode={viewMode}
              onToggleSave={toggleSave}
              onSaveCustomPrompt={onSaveCustomPrompt}
              allPrompts={allPrompts}            
            />

            {/* Prompt Modal */}
            {selectedPrompt && (
              <PromptModal prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} onToggleSave={toggleSave}/>
            )}

            {/* Custom Prompt Builder */}
            {showCustomBuilder && <CustomPromptBuilder onClose={() => setShowCustomBuilder(false)} onSaveCustomPrompt={onSaveCustomPrompt} />}
          </div>
        </div>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
