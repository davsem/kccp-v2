"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSectionById } from "@/lib/pitch-data";
import type { SectionOwnerConfig } from "@/lib/types";

interface SectionOwnerNamesProps {
  sectionIds: string[];
  defaultName: string;
  onContinue: (configs: SectionOwnerConfig[]) => void;
}

export function SectionOwnerNames({ sectionIds, defaultName, onContinue }: SectionOwnerNamesProps) {
  const [useNameForAll, setUseNameForAll] = useState(true);
  const [configs, setConfigs] = useState<Record<string, { ownerName: string; showName: boolean; override: boolean }>>(
    () =>
      Object.fromEntries(
        sectionIds.map((id) => [id, { ownerName: defaultName, showName: true, override: false }])
      )
  );

  function setField(id: string, field: "ownerName" | "showName" | "override", value: string | boolean) {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function handleBulkToggle(checked: boolean) {
    setUseNameForAll(checked);
    if (checked) {
      setConfigs((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([id, c]) => [id, { ...c, ownerName: defaultName, override: false }])
        )
      );
    }
  }

  function handleContinue() {
    const result: SectionOwnerConfig[] = sectionIds.map((id) => ({
      section_id: id,
      owner_name: (useNameForAll && !configs[id]?.override) ? defaultName : (configs[id]?.ownerName ?? defaultName),
      show_owner_name: configs[id]?.showName ?? true,
    }));
    onContinue(result);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Name Your Sections</h2>

      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
        <Switch
          id="use-name-for-all"
          checked={useNameForAll}
          onCheckedChange={handleBulkToggle}
        />
        <Label htmlFor="use-name-for-all" className="cursor-pointer">
          Use &ldquo;<strong>{defaultName}</strong>&rdquo; for all sections
        </Label>
      </div>

      <div className="space-y-3">
        {sectionIds.map((id) => {
          const section = getSectionById(id);
          const config = configs[id];
          const isOverriding = !useNameForAll || config?.override;
          return (
            <Card key={id}>
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{section?.label}</span>
                    <span className="text-muted-foreground ml-2 text-sm">£{section?.price}</span>
                  </div>
                  {useNameForAll && !config?.override && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setField(id, "override", true)}
                    >
                      Name differently
                    </Button>
                  )}
                </div>

                {isOverriding && (
                  <Input
                    value={config?.ownerName ?? ""}
                    onChange={(e) => setField(id, "ownerName", e.target.value)}
                    placeholder="Owner name"
                  />
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`show-${id}`}
                    checked={config?.showName ?? true}
                    onCheckedChange={(checked) => setField(id, "showName", !!checked)}
                  />
                  <Label htmlFor={`show-${id}`} className="text-sm cursor-pointer">
                    Show name publicly on pitch
                  </Label>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button className="w-full" onClick={handleContinue}>
        Continue to Billing
      </Button>
    </div>
  );
}
