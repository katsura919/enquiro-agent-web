"use client"

import * as React from "react"
import { ChevronsUpDownIcon, UserCircle, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import api from "@/utils/api"

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface CaseOwnerComboboxProps {
  value?: string; // Agent ID
  onValueChange: (value: string) => void | Promise<void>; // Allow both sync and async
  businessId?: string; // Add businessId for filtering
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  currentAgentName?: string; // Current agent name to display
}

export function CaseOwnerCombobox({
  value,
  onValueChange,
  businessId,
  placeholder = "Select agent...",
  disabled = false,
  className,
  currentAgentName
}: CaseOwnerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [agents, setAgents] = React.useState<Agent[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null)
  const [saving, setSaving] = React.useState(false) // Add saving state

  // Debounce search query
  const debouncedSearchQuery = React.useMemo(() => {
    const timeoutId = setTimeout(() => searchQuery, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Fetch agents based on search query
  const fetchAgents = React.useCallback(async (search: string = "") => {
    setLoading(true)
    try {
      const params: any = {}
      if (search.trim()) {
        params.search = search.trim()
      }
      if (businessId) {
        params.businessId = businessId
      }

      const response = await api.get('/agent/search', { params })
      setAgents(response.data || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [businessId])

  // Initial load and search effect
  React.useEffect(() => {
    if (open) {
      fetchAgents(searchQuery)
    }
  }, [open, searchQuery, fetchAgents])

  // Load selected agent details if value is provided
  React.useEffect(() => {
    if (value) {
      const loadSelectedAgent = async () => {
        try {
          const response = await api.get(`/agent/${value}`)
          setSelectedAgent(response.data)
        } catch (error) {
          console.error('Error loading selected agent:', error)
          setSelectedAgent(null)
        }
      }
      loadSelectedAgent()
    } else {
      setSelectedAgent(null)
    }
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || saving}
          className={cn("justify-between bg-card", className)}
        >
          <div className="flex items-center gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {saving ? "Saving..." : value && currentAgentName ? currentAgentName : selectedAgent ? selectedAgent.name : placeholder}
            </span>
          </div>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 mr-6" align="start" sideOffset={4}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search agents..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>No agent found.</CommandEmpty>
                <CommandGroup>
                  {/* Unassigned option */}
                  <CommandItem
                    value="unassigned"
                    onSelect={async () => {
                      setSaving(true)
                      try {
                        const result = onValueChange("")
                        if (result instanceof Promise) {
                          await result
                        }
                        setSelectedAgent(null)
                      } catch (error) {
                        console.error('Error updating case owner:', error)
                      } finally {
                        setSaving(false)
                        setOpen(false)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      <div >
                        <p className="text-sm font-medium">Remove Owner</p>
                        <p className="text-xs text-muted-foreground">No agent assigned</p>
                      </div>
                    </div>
                  </CommandItem>
                  
                  {/* Agent options */}
                  {(searchQuery.trim() ? agents : agents.slice(0, 5)).map((agent) => (
                    <CommandItem
                      key={agent._id}
                      value={agent._id}
                      onSelect={async () => {
                        setSaving(true)
                        try {
                          const result = onValueChange(agent._id)
                          if (result instanceof Promise) {
                            await result
                          }
                          setSelectedAgent(agent)
                        } catch (error) {
                          console.error('Error updating case owner:', error)
                        } finally {
                          setSaving(false)
                          setOpen(false)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.email}</p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                  
                  {/* Show "Type to search" hint when agents are limited */}
                  {!searchQuery.trim() && agents.length > 5 && (
                    <div className="px-2 py-2 text-xs text-muted-foreground text-center border-t">
                      Type to search for more agents.
                    </div>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
