import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RuleDialog from "./rule-dialog";
import type { Rule } from "@shared/schema";

interface RulesManagementProps {
  botId: string;
}

export default function RulesManagement({ botId }: RulesManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery<Rule[]>({
    queryKey: ["/api/servers", botId, "rules"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      await apiRequest("DELETE", `/api/rules/${ruleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", botId, "rules"] });
      toast({
        title: "Rule Deleted",
        description: "The rule has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the rule.",
        variant: "destructive",
      });
    },
  });

  const handleAddRule = () => {
    setEditingRule(null);
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const handleDeleteRule = (ruleId: number) => {
    deleteMutation.mutate(ruleId);
  };

  if (isLoading) {
    return (
      <Card className="discord-medium border-gray-700">
        <CardHeader>
          <CardTitle>Bot Rules & Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-discord-blurple border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="discord-medium border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bot Rules & Commands</CardTitle>
            <Button
              onClick={handleAddRule}
              className="discord-blurple hover:bg-blue-600 transition-colors"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules?.map((rule) => (
              <div key={rule.id} className="discord-dark rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rule.type === "COMMAND" ? "discord-blurple" : "bg-discord-green"
                    }`}>
                      {rule.type}
                    </span>
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRule(rule)}
                      className="discord-light hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-discord-red hover:text-red-400"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="discord-light text-sm">{rule.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="discord-light">
                    {rule.type === "COMMAND" ? "Permission" : "Trigger"}: {" "}
                    <span className="text-white">
                      {rule.permission || rule.trigger || "N/A"}
                    </span>
                  </span>
                  <span className="discord-light">
                    Used: <span className="text-white">{rule.usageCount || rule.triggerCount || 0}</span> times
                  </span>
                </div>
              </div>
            ))}
            
            {!rules?.length && (
              <div className="text-center py-8">
                <p className="discord-light">No rules configured yet.</p>
                <Button
                  onClick={handleAddRule}
                  variant="outline"
                  className="mt-2"
                >
                  Create your first rule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RuleDialog
        botId={botId}
        rule={editingRule}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
