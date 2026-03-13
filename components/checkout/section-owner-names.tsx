"use client";

import { useState } from "react";
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
  const [configs, setConfigs] = useState<Record<string, { ownerName: string; showName: boolean; override: boolean }>>(
    () =>
      Object.fromEntries(
        sectionIds.map((id) => [id, { ownerName: defaultName, showName: true, override: false }])
      )
  );

  function setField(id: string, field: "ownerName" | "showName" | "override", value: string | boolean) {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function handleContinue() {
    const result: SectionOwnerConfig[] = sectionIds.map((id) => ({
      section_id: id,
      owner_name: configs[id]?.ownerName ?? defaultName,
      show_owner_name: configs[id]?.showName ?? true,
    }));
    onContinue(result);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Name Your Sections</h2>

      <div className="space-y-3">
        {sectionIds.map((id) => {
          const section = getSectionById(id);
          const config = configs[id];
          return (
            <Card key={id}>
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{section?.label}</span>
                    <span className="text-muted-foreground ml-2 text-sm">£{section?.price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {!config?.override && (
                    <span className="text-sm">{config?.ownerName}</span>
                  )}
                  {!config?.override && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setField(id, "override", true)}
                    >
                      Change sponsor name
                    </Button>
                  )}
                </div>

                {config?.override && (
                  <Input
                    value={config?.ownerName ?? ""}
                    onChange={(e) => setField(id, "ownerName", e.target.value)}
                    placeholder="Owner name"
                  />
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`show-${id}`}
                    checked={!(config?.showName ?? true)}
                    onCheckedChange={(checked) => setField(id, "showName", !checked)}
                  />
                  <Label htmlFor={`show-${id}`} className="text-sm cursor-pointer">
                    Keep anonymous
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
