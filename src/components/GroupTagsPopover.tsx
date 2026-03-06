import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tags } from "lucide-react";
import { useUpdateMovieGroup } from "@/hooks/useUpdateMovieGroup";

interface GroupTagsPopoverProps {
    movieId: number;
    currentGroups: string[];
    allGroups: string[];
}

export function GroupTagsPopover({ movieId, currentGroups, allGroups }: GroupTagsPopoverProps) {
    const updateGroup = useUpdateMovieGroup();

    const toggleGroup = (group: string, checked: boolean) => {
        let newGroups = [...currentGroups];
        if (checked) {
            newGroups.push(group);
        } else {
            newGroups = newGroups.filter(g => g !== group);
        }
        updateGroup.mutate({ movieId, group: newGroups.length > 0 ? newGroups : null });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Tags className="h-3.5 w-3.5" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-3">
                    <h4 className="text-sm font-medium leading-none">Manage Groups</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {allGroups.map(group => (
                            <div key={group} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`tag-${movieId}-${group}`}
                                    checked={currentGroups.includes(group)}
                                    onCheckedChange={(checked) => toggleGroup(group, checked as boolean)}
                                />
                                <label
                                    htmlFor={`tag-${movieId}-${group}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {group}
                                </label>
                            </div>
                        ))}
                        {allGroups.length === 0 && (
                            <div className="text-xs text-muted-foreground">No groups created yet. Use 'Manage Groups' on the shelf to create one.</div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
