import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertRuleSchema } from "@shared/schema";
import type { Rule } from "@shared/schema";

const formSchema = insertRuleSchema.extend({
  permission: z.string().optional(),
  trigger: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RuleDialogProps {
  botId: string;
  rule?: Rule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RuleDialog({ botId, rule, open, onOpenChange }: RuleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botId,
      name: "",
      type: "COMMAND",
      description: "",
      permission: "",
      trigger: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        botId: rule.botId,
        name: rule.name,
        type: rule.type,
        description: rule.description,
        permission: rule.permission || "",
        trigger: rule.trigger || "",
        isActive: rule.isActive,
      });
    } else {
      form.reset({
        botId,
        name: "",
        type: "COMMAND",
        description: "",
        permission: "",
        trigger: "",
        isActive: true,
      });
    }
  }, [rule, botId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const cleanData = {
        ...data,
        permission: data.permission || null,
        trigger: data.trigger || null,
      };
      const response = await apiRequest("POST", `/api/bots/${botId}/rules`, cleanData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "rules"] });
      toast({
        title: "Rule Created",
        description: "The rule has been successfully created.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the rule.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const cleanData = {
        ...data,
        permission: data.permission || null,
        trigger: data.trigger || null,
      };
      const response = await apiRequest("PATCH", `/api/rules/${rule!.id}`, cleanData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "rules"] });
      toast({
        title: "Rule Updated",
        description: "The rule has been successfully updated.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the rule.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (rule) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const watchType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="discord-medium border-gray-700">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit Rule" : "Create New Rule"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., !kick or Anti-Spam"
                      {...field}
                      className="discord-dark border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="discord-dark border-gray-600">
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COMMAND">Command</SelectItem>
                      <SelectItem value="AUTO">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this rule does..."
                      {...field}
                      className="discord-dark border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === "COMMAND" && (
              <FormField
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Permission</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., KICK_MEMBERS, BAN_MEMBERS"
                        {...field}
                        className="discord-dark border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "AUTO" && (
              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Condition</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 5+ messages/sec, spam words"
                        {...field}
                        className="discord-dark border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="discord-blurple hover:bg-blue-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? (rule ? "Updating..." : "Creating...")
                  : (rule ? "Update Rule" : "Create Rule")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
