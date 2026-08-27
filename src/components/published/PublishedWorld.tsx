"use client";

import React from "react";
import { TemplateView } from "@/templates";
import type { BirthdayProject, TemplateId } from "@/lib/types";

export function PublishedWorld({ project }: { project: BirthdayProject }) {
  return <TemplateView project={project} templateId={(project.templateId ?? "contact-sheet") as TemplateId} device="auto" />;
}
