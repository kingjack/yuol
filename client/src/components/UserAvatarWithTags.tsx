import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Plus, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserAvatarWithTagsProps {
  user: {
    id: number;
    name?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  editable?: boolean;
  orientation?: "vertical" | "horizontal";
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-xl",
  "2xl": "h-32 w-32 text-2xl",
};

const badgeSizeClasses = {
  sm: "text-[10px] px-1 py-0 h-4",
  md: "text-xs px-1.5 py-0.5 h-5",
  lg: "text-sm px-2 py-0.5 h-6",
  xl: "text-sm px-2 py-0.5 h-6",
  "2xl": "text-base px-2.5 py-0.5 h-7",
};

export function UserAvatarWithTags({
  user,
  size = "md",
  className,
  editable = true,
  orientation = "vertical",
  children,
}: UserAvatarWithTagsProps) {
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const utils = trpc.useContext();

  // Only fetch tags if we have a valid user ID
  const { data: tags } = trpc.userTags.list.useQuery(
    { userId: user.id },
    { enabled: !!user.id && user.id > 0 }
  );

  const addTagMutation = trpc.userTags.add.useMutation({
    onSuccess: () => {
      utils.userTags.list.invalidate({ userId: user.id });
      setNewTag("");
      setIsAddTagOpen(false);
      toast.success("标签添加成功");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const voteMutation = trpc.userTags.vote.useMutation({
    onSuccess: () => {
      utils.userTags.list.invalidate({ userId: user.id });
      toast.success("投票成功");
    },
    onError: (error) => {
      if (error.message.includes("已经投过票了")) {
        toast.error("你已经给这个标签投过票了");
      } else {
        toast.error("投票失败");
      }
    },
  });

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    addTagMutation.mutate({ userId: user.id, label: newTag.trim() });
  };

  const handleVote = (tagId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    voteMutation.mutate({ tagId });
  };

  // Top tags to display
  const limit = orientation === "horizontal" ? 20 : 3;
  const displayTags = tags?.slice(0, limit) || [];
  const hasMoreTags = (tags?.length || 0) > limit;

  return (
    <div 
      className={cn(
        "relative inline-flex group", 
        orientation === "vertical" ? "flex-col items-center" : "flex-row items-start gap-6",
        className
      )}
    >
      <div className="relative shrink-0">
        <Avatar className={cn(sizeClasses[size], "border-2 border-white dark:border-slate-800 shadow-sm")}>
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            {user.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        {/* Add Tag Button (visible on hover) */}
        {editable && user.id > 0 && (
          <Popover open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
            <PopoverTrigger asChild>
              <button 
                className="absolute -right-2 -top-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
                title="添加标签"
              >
                <Plus size={12} className="text-orange-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3">
              <form onSubmit={handleAddTag} className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Tag size={14} /> 给 {user.name} 贴标签
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入标签 (如: 技术大牛)"
                    className="h-8 text-sm"
                    maxLength={10}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="h-8 px-2 bg-orange-500 hover:bg-orange-600"
                    // disabled={addTagMutation.isLoading}
                  >
                    添加
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Content Container */}
      <div className={cn(
        "flex",
        orientation === "vertical" 
          ? "flex-col items-center mt-1 w-full" 
          : "flex-col items-start gap-2 pt-1 w-full"
      )}>
        {orientation === "horizontal" && children}

        {/* Tags Display */}
        <div className={cn(
          "flex flex-wrap gap-1.5",
          orientation === "vertical" ? "justify-center max-w-[120px]" : "justify-start w-full"
        )}>
          {displayTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={cn(
                "cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-200 shadow-sm whitespace-nowrap z-0",
                badgeSizeClasses[size]
              )}
              onClick={(e) => handleVote(tag.id, e)}
              title={`点击 +1 (当前: ${tag.voteCount})`}
            >
              {tag.label} <span className="ml-0.5 text-[0.8em] opacity-70">+{tag.voteCount}</span>
            </Badge>
          ))}
          {hasMoreTags && (
             <Badge variant="outline" className={cn("opacity-50", badgeSizeClasses[size])}>
               +{tags!.length - limit}
             </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
